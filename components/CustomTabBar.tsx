import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scaleAnimations = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const opacityAnimations = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const floatingScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(floatingScale, {
        toValue: 1.1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(floatingScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [floatingScale]);

  const handlePress = (index: number, routeName: string) => {
    const event = navigation.emit({
      type: "tabPress",
      target: routeName,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      Animated.sequence([
        Animated.timing(scaleAnimations[index], {
          toValue: 0.8,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimations[index], {
          toValue: 1,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();

      // Animación especial para el botón flotante
      if (index === 2) {
        Animated.sequence([
          Animated.timing(floatingScale, {
            toValue: 0.9,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(floatingScale, {
            toValue: 1,
            duration: 100,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start();
      }

      navigation.navigate(routeName);
    }
  };

  

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.backgroundOverlay} />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        const isMiddle = index === 2;

        if (isMiddle) {
          return (
            <View key={route.key} style={styles.floatingButtonContainer}>
              <Animated.View style={[styles.floatingButton, isFocused && styles.floatingButtonActive, { transform: [{ scale: floatingScale }] }]}>
                <View style={styles.floatingButtonInner}>
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color: isFocused ? "#D97706" : "#FFFFFF",
                    size: 28,
                  })}
                </View>
                {isFocused && <View style={styles.floatingGlow} />}
              </Animated.View>

              <Animated.Text
                style={[
                  styles.floatingTabLabel,
                  {
                    color: isFocused ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    opacity: opacityAnimations[index],
                  },
                ]}
              >
                {label as string}
              </Animated.Text>
            </View>
          );
        }

        // Renderizar los demás botones normales con mejoras
        return (
          <TouchableOpacity key={route.key} onPress={() => handlePress(index, route.name)} style={styles.tabButton} activeOpacity={0.7}>
            <Animated.View style={[styles.tabIconContainer, { transform: [{ scale: scaleAnimations[index] }] }]}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                size: 24,
              })}

              {/* Indicador activo */}
              {isFocused && <View style={styles.activeDot} />}
            </Animated.View>

            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                  opacity: opacityAnimations[index],
                },
              ]}
            >
              {label as string}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    height: 90,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "space-around",
    position: "relative",
    overflow: "visible",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#D97706",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  activeDot: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  floatingButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -45,
    position: "relative",
  },
  floatingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    position: "relative",
  },
  floatingButtonActive: {
    backgroundColor: "#F8D49A",
    shadowColor: "#D97706",
    shadowOpacity: 0.4,
  },
  floatingButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  floatingTabLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: "600",
    letterSpacing: 0.2,
    position: "absolute",
    bottom: -20,
  },
});
