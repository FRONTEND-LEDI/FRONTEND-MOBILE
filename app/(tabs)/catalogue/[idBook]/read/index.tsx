import {
  getBookProgressById,
  postSaveProgress,
  updateBookProgress,
} from "@/app/api/bookProgress";
import { URI_VISOR } from "@/constants/ip";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const DEBOUNCE_DELAY = 2000;

export default function ReadBook() {
  const { idBook } = useLocalSearchParams();
  console.log("el id", idBook);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [existingProgressId, setExistingProgressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uri, setUri] = useState("");
  const webviewRef = useRef<WebView>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialProgressLoaded = useRef(false);
  const hasSentInitialPage = useRef(false);
  const isSavingRef = useRef(false);
  const lastPageFromProgress = useRef(1); // Guardar la página del progreso

  // Obtener progreso existente y construir URI después de conocer la página guardada
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await getBookProgressById(idBook as string);
        if (progressData && progressData._id) {
          setExistingProgressId(progressData._id);
          const savedPage = progressData.position || 1;
          lastPageFromProgress.current = savedPage; // Guardar la página
          setCurrentPage(savedPage);
          setTotalPages(progressData.total || 0);
          
          // Construir URI con la página guardada después de obtener el progreso
          setUri(`http://${URI_VISOR}/book/read/${idBook}?page=${savedPage}`);
          console.log("Progreso existente encontrado:", progressData._id, "Página:", savedPage);
        } else {
          // Sin progreso, usar página 1
          lastPageFromProgress.current = 1;
          setUri(`http://${URI_VISOR}/book/read/${idBook}?page=1`);
          console.log("No se encontró progreso existente");
        }
      } catch (error) {
        console.log("Error obteniendo progreso:", error);
        // Fallback a página 1 en caso de error
        lastPageFromProgress.current = 1;
        console.log(`http://${URI_VISOR}/book/read/${idBook}?page=1`);
        setUri(`http://${URI_VISOR}/book/read/${idBook}?page=1`);
      } finally {
        setIsLoading(false);
        hasInitialProgressLoaded.current = true;
      }
    };
    
    if (!hasInitialProgressLoaded.current) {
      fetchProgress();
    }
  }, [idBook]);

  /**
   * Función para guardar progreso
   * Se usa useCallback para evitar recreaciones innecesarias
   */
  const saveProgress = useCallback(async (page: number, total: number, isFinished: boolean) => {
    // Evitar múltiples llamadas simultáneas
    if (isSavingRef.current) {
      console.log("Ya se está guardando, ignorando llamada...");
      return;
    }

    try {
      isSavingRef.current = true;
      
      // No guardar si no tenemos el total de páginas aún
      if (total === 0) {
        console.log("Total es 0, ignorando guardado");
        return;
      }
      
      const status = isFinished ? "finished" : "reading";
      const percent = total > 0 ? (page / total) * 100 : 0;

      console.log("Intentando guardar progreso:", { 
        page, total, status, 
        hasExisting: !!existingProgressId 
      });

      if (existingProgressId) {
        await updateBookProgress(existingProgressId, {
          status,
          position: page,
          percent,
          total,
          unit: "page",
        });
        console.log("Progreso actualizado:", page, "/", total);
      } else {
        const newProgress = await postSaveProgress({
          idBook: idBook as string,
          status,
          position: page,
          percent,
          total,
          unit: "page",
        });
        if (newProgress && newProgress._id) {
          setExistingProgressId(newProgress._id);
          console.log("Progreso creado:", newProgress._id, page, "/", total);
        }
      }
    } catch (error) {
      console.log("Error saving progress:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [existingProgressId, idBook]);

  /**
   * Debounce manual mejorado para guardar progreso
   * Evita múltiples llamadas a la API en un corto período
   */
  const debounceSaveProgress = useCallback((page: number, total: number, isFinished: boolean) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Solo guardar si los valores son válidos
    if (page > 0 && total > 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        saveProgress(page, total, isFinished);
      }, DEBOUNCE_DELAY);
    }
  }, [saveProgress]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Manejador de mensajes del WebView
   * Procesa los mensajes enviados desde el componente PdfViewer
   */
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Mensaje recibido:", data.type, data);

      switch (data.type) {
        case "LOADED":
          if (data.total && data.total > 0) {
            setTotalPages(data.total);
          }
          
          // Navegar a la página guardada después de que el PDF esté completamente cargado
          if (lastPageFromProgress.current > 1 && webviewRef.current && !hasSentInitialPage.current) {
            hasSentInitialPage.current = true;
            
            // Esperar un poco más para asegurar que el PDF esté completamente renderizado
            setTimeout(() => {
              webviewRef.current?.injectJavaScript(`
                (function() {
                  // Verificar si la función goToPage está disponible
                  if (typeof window.goToPage === 'function') {
                    console.log("Navegando a página guardada:", ${lastPageFromProgress.current});
                    window.goToPage(${lastPageFromProgress.current});
                    
                    // Enviar confirmación
                    window.ReactNativeWebView?.postMessage(
                      JSON.stringify({
                        type: "INITIAL_NAVIGATION_COMPLETE",
                        page: ${lastPageFromProgress.current}
                      })
                    );
                  } else {
                    console.log("goToPage no está disponible aún, reintentando...");
                    // Reintentar después de un breve delay
                    setTimeout(() => {
                      if (typeof window.goToPage === 'function') {
                        window.goToPage(${lastPageFromProgress.current});
                        window.ReactNativeWebView?.postMessage(
                          JSON.stringify({
                            type: "INITIAL_NAVIGATION_COMPLETE",
                            page: ${lastPageFromProgress.current}
                          })
                        );
                      }
                    }, 300);
                  }
                })();
              `);
            }, 1200); // Aumentar timeout para asegurar renderizado completo
          }
          break;

        case "PAGE_CHANGE":
          const { page, total, finished } = data;
          
          // Validar que los datos sean correctos
          if (page > 0 && total > 0 && page <= total) {
            // Solo actualizar si hay un cambio real
            if (page !== currentPage || total !== totalPages) {
              setCurrentPage(page);
              setTotalPages(total);
              
              // Guardar progreso con debounce
              debounceSaveProgress(page, total, finished);
              
              console.log("Página cambiada:", page, "/", total, finished ? "(FINISHED)" : "");
            }
            
            // Si está finished, guardar inmediatamente
            if (finished) {
              // Limpiar debounce existente
              if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
              }
              // Guardar inmediatamente
              saveProgress(page, total, true);
            }
          }
          break;
          
        case "BOOK_FINISHED":
          // Guardar inmediatamente cuando se finaliza el libro
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
          }
          saveProgress(data.page, data.total, true);
          break;

        case "PAGE_CHANGE_CONFIRMED":
          console.log("Navegación inicial confirmada:", data.page);
          break;
          
        case "INITIAL_NAVIGATION_COMPLETE":
          console.log("Navegación inicial completada exitosamente:", data.page);
          break;

        default:
          break;
      }
    } catch (err) {
      console.log("Error parsing message:", err);
    }
  };

  // Forzar guardado al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      // Guardar inmediatamente al salir solo si tenemos datos válidos
      if (currentPage > 0 && totalPages > 0) {
        saveProgress(currentPage, totalPages, currentPage === totalPages);
      }
    };
  }, [currentPage, totalPages, saveProgress]);

  // Prevenir recargas del WebView - función estable
  const onShouldStartLoadWithRequest = useCallback((request: any) => {
    // Solo permitir la URL inicial, bloquear cualquier otra carga
    const shouldStart = request.url === uri;
    if (!shouldStart) {
      console.log("Bloqueando recarga no deseada:", request.url);
    }
    return shouldStart;
  }, [uri]);

  // MOSTRAR LOADING hasta que la URI esté lista
  if (isLoading || !uri) {
    return (
      <View className="flex justify-center items-center ">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WebView
        ref={webviewRef}
        source={{ uri }} 
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleMessage}
        onLoadStart={() => console.log("WebView loading started")}
        onLoadEnd={() => console.log("WebView loading finished")}
        onError={(error) => console.log("WebView error:", error.nativeEvent)}
        onHttpError={(error) => console.log("WebView HTTP error:", error.nativeEvent)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        renderLoading={() => (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}