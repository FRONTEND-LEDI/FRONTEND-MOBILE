import colors from "@/constants/colors";
import { IP_ADDRESS } from "@/constants/configEnv";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UserAvatarData {
  url_secura: string;
  id_image: string;
}

interface UserAvatar {
  _id: string;
  gender: string;
  avatars: UserAvatarData;
  __v: number;
}

type User = {
  name: string;
  email: string;
  userName: string;
  nivel: string;
  avatar: UserAvatar;
};

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  console.log(user);
  useEffect(() => {
    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      try {
        const userReq = await fetch(`http://${IP_ADDRESS}:3402/oneUser`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const userRes = await userReq.json();
        setUser(userRes.result);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>
      <View style={styles.profileSectionContainer}>
        <View style={styles.profileSection}>
          {user ? (
            <>
              <View style={styles.profilePic}>
                <Image
                  className="w-full h-full rounded-full"
                  source={{ uri: user.avatar.avatars.url_secura }}
                />
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.email}>Usuario: {user.userName}</Text>
              <Text style={styles.email}>Nivel: {user.nivel}</Text>
            </>
          ) : (
            <Text style={styles.email}>Cargando datos...</Text>
          )}
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GENERAL</Text>

        <View style={styles.sectionItem}>
          <Text style={styles.itemTitle}>Profile Settings</Text>
          <Text style={styles.itemSubtitle}>
            Update and modify your profile
          </Text>
        </View>

        <View style={styles.optionItem}>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Notifications</Text>
            <Text style={styles.optionSubtitle}>
              Change your notification settings
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <View style={{ marginTop: 30, alignItems: "center" }}></View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff0ee",
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "#ff3b30",
          }}
        >
          <TouchableOpacity
            style={styles.logoutText}
            onPress={async () => {
              await SecureStore.deleteItemAsync("token");
              router.replace("/(auth)/signin");
            }}
          >
            <MaterialIcons name="logout" size={24} color="#ff3b30" />
            <Text>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomColor: colors.gray,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileSectionContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8d49a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#a7c257",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#f29200",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 15,
  },
  sectionItem: {
    marginBottom: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f29200",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: "#f29200",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  checkbox: {
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  activeNavItem: {
    color: "#4a90e2",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  logoutText: {
    fontSize: 16,
    color: "#ff3b30",
    fontWeight: "bold",
    marginLeft: 20,
  },
  activeNavText: {
    color: "#4a90e2",
  },
});

export default ProfileScreen;
