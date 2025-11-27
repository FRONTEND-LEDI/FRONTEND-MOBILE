import { AvatarResponse, getAvatar } from "@/app/api/auth";
import { updateUser } from "@/app/api/profile";
import { getFormats, getSubgenres } from "@/app/api/types";
import { UserType } from "@/app/context/authContext";
import colors from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: UserType;
    onUpdateSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    user,
    onUpdateSuccess,
}) => {
    const [updating, setUpdating] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [availableFormats, setAvailableFormats] = useState<string[]>([]);
    const [availableSubgenres, setAvailableSubgenres] = useState<string[]>([]);
    const [avatars, setAvatars] = useState<AvatarResponse[]>([]);
    const [loadingAvatars, setLoadingAvatars] = useState(false);

    const [editForm, setEditForm] = useState({
        name: "",
        lastName: "",
        userName: "",
        birthDate: new Date(),
        avatar: "",
        preference: {
            category: [] as string[],
            format: [] as string[],
        },
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || "",
                lastName: user.lastName || "",
                userName: user.userName || "",
                birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
                avatar:
                    typeof user.avatar === "string"
                        ? user.avatar
                        : user.avatar?.avatars?.url_secura || "",
                preference: {
                    category: user.preference?.category || [],
                    format: user.preference?.format || [],
                },
            });
        }
    }, [user, visible]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const formats = await getFormats();
                const subgenres = await getSubgenres();
                setAvailableFormats(formats);
                setAvailableSubgenres(subgenres);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        const loadAvatars = async () => {
            try {
                setLoadingAvatars(true);
                const data = await getAvatar();
                setAvatars(data);
            } catch (error) {
                console.error("Error fetching avatars:", error);
            } finally {
                setLoadingAvatars(false);
            }
        };

        if (visible) {
            fetchOptions();
            loadAvatars();
        }
    }, [visible]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setUpdating(true);
        try {

            const updatedData: any = {
                ...user,
                name: editForm.name,
                lastName: editForm.lastName,
                userName: editForm.userName,
                birthDate: editForm.birthDate.toISOString(),
                avatar: editForm.avatar,
                preference: editForm.preference,
            };

            console.log("datos a cambiar", updatedData)
            await updateUser(updatedData);

            Alert.alert("Éxito", "Perfil actualizado correctamente");
            onUpdateSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "No se pudo actualizar el perfil");
        } finally {
            setUpdating(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setEditForm({ ...editForm, birthDate: selectedDate });
        }
    };

    const togglePreference = (type: "category" | "format", value: string) => {
        setEditForm((prev) => {
            const currentList = prev.preference[type];
            const newList = currentList.includes(value)
                ? currentList.filter((item) => item !== value)
                : [...currentList, value];
            return {
                ...prev,
                preference: {
                    ...prev.preference,
                    [type]: newList,
                },
            };
        });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity
                        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={onClose}
                    />
                    <View className="bg-white rounded-t-3xl h-[90%] shadow-2xl">
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">Editar Perfil</Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialIcons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                            {/* Avatar Selection */}
                            <View className="mb-5">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                    Selecciona tu Avatar
                                </Text>
                                {loadingAvatars ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <View className="flex-row flex-wrap justify-center">
                                        {avatars.map((item) => {
                                            const isSelected =
                                                editForm.avatar === item._id ||
                                                editForm.avatar === item.avatars.url_secura;
                                            return (
                                                <TouchableOpacity
                                                    key={item._id}
                                                    onPress={() =>
                                                        setEditForm({ ...editForm, avatar: item._id })
                                                    }
                                                    className={`m-2 p-1 border rounded-full ${isSelected
                                                        ? "bg-orange-100 border-orange-500"
                                                        : "bg-white border-gray-300"
                                                        }`}
                                                    style={
                                                        isSelected
                                                            ? {
                                                                backgroundColor: colors.primary,
                                                                borderColor: colors.primary,
                                                            }
                                                            : {}
                                                    }
                                                >
                                                    <Image
                                                        source={{ uri: item.avatars.url_secura }}
                                                        className="w-16 h-16 rounded-full"
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Name & Last Name */}
                            <View className="flex-row gap-4 mb-5">
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">
                                        Nombre
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                                        value={editForm.name}
                                        onChangeText={(text) =>
                                            setEditForm({ ...editForm, name: text })
                                        }
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">
                                        Apellido
                                    </Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                                        value={editForm.lastName}
                                        onChangeText={(text) =>
                                            setEditForm({ ...editForm, lastName: text })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Username */}
                            <View className="mb-5">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                    Nombre de Usuario
                                </Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
                                    value={editForm.userName}
                                    onChangeText={(text) =>
                                        setEditForm({ ...editForm, userName: text })
                                    }
                                />
                            </View>

                            {/* Birth Date */}
                            <View className="mb-8">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                    Fecha de Nacimiento
                                </Text>
                                <TouchableOpacity
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text className="text-gray-800">
                                        {editForm.birthDate.toLocaleDateString()}
                                    </Text>
                                    <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={editForm.birthDate}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </View>

                            {/* Preferences - Categories */}
                            <View className="mb-5">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                    Géneros Favoritos
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {availableSubgenres.map((genre) => {
                                        const isSelected =
                                            editForm.preference.category.includes(genre);
                                        return (
                                            <TouchableOpacity
                                                key={genre}
                                                onPress={() => togglePreference("category", genre)}
                                                className={`px-3 py-2 rounded-full border ${isSelected
                                                    ? "bg-indigo-100 border-indigo-500"
                                                    : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs font-medium ${isSelected ? "text-indigo-700" : "text-gray-600"
                                                        }`}
                                                >
                                                    {genre}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Preferences - Formats */}
                            <View className="mb-5">
                                <Text className="text-sm font-bold text-gray-700 mb-2">
                                    Formatos Preferidos
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {availableFormats.map((format) => {
                                        const isSelected =
                                            editForm.preference.format.includes(format);
                                        return (
                                            <TouchableOpacity
                                                key={format}
                                                onPress={() => togglePreference("format", format)}
                                                className={`px-3 py-2 rounded-full border ${isSelected
                                                    ? "bg-emerald-100 border-emerald-500"
                                                    : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs font-medium ${isSelected ? "text-emerald-700" : "text-gray-600"
                                                        }`}
                                                >
                                                    {format}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="h-20" />
                        </ScrollView>

                        <View className="p-5 border-t border-gray-100 bg-white pb-8">
                            <TouchableOpacity
                                className="w-full py-4 rounded-xl shadow-lg shadow-orange-200 flex-row justify-center items-center"
                                style={{ backgroundColor: colors.primary }}
                                onPress={handleUpdateProfile}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">
                                        Guardar Cambios
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default EditProfileModal;
