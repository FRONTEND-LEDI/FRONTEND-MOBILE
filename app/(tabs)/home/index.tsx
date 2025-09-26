
import { getBooks } from "@/app/api/catalogue";
import { booksbyRecomendation, getBookbyLatestProgress } from "@/app/api/recomendations";
import { authContext } from "@/app/context/authContext";
import Banner from "@/assets/images/biblioteca.png";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect, useState } from "react";
import { Button, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookCarousel from "../../../components/BookCarousel";
export default function Home() {
  const router = useRouter();
  const { logout, isLogin } = useContext(authContext);
  const [books, setBooks] = useState([]);
  const [recommendations, setRecomendations] = useState([])
  const [booksLatest, setBookLatest] = useState([])

  useEffect(() => {
    const verificarSesion = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token || !isLogin) {
        router.push("/(auth)/signin");
      }
    };
    verificarSesion();
  }, [isLogin, router]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getBooks();
        

        setBooks(data);
      } catch (error) {
        console.log("Error al obtener los libros:", error);
      }

    }
    getData();
  
    
  }, [])

  useEffect(() => {
    const getByRecommendations = async ()=>{
      const recommendations = await booksbyRecomendation()

      setRecomendations(recommendations)
    }

    getByRecommendations()
    
  },[])

  useEffect(()=>{
    const getByProgress = async()=>{
      const bookLatest = await getBookbyLatestProgress()

      setBookLatest(bookLatest)

    }

    getByProgress()
  },[])
  
  

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <View className={`p-4 bg-[url(${Banner})]`}>
        <Image className='w-full h-40 rounded-lg' source={Banner}></Image>
      </View>
      <View className="px-4">
        <Text className="text-semibold text-xl text-primary font-semibold">Te podría interesar</Text>
  
        <BookCarousel data={recommendations}/>
      </View>
      <View className="px-4">
        <Text className="text-semibold text-xl text-primary font-semibold">Continua tu progreso</Text>
  
        <BookCarousel data={booksLatest}/>
      </View>
      <View className="px-4">
        <Text className="text-semibold text-xl text-primary font-semibold">Antologías</Text>
  
        <BookCarousel data={books}/>
      </View>
      <View className="px-4">
        <Button title="Cerrar sesión" onPress={logout} />
      </View> 
    
    </SafeAreaView>
  );
}

