// Login Screen with API Integration
// Save as: app/(auth)/signin.tsx

import { useState } from "react";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Link, useRouter } from "expo-router";
import { Image, Text, View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { AuthService } from "@/services/api/authService";

export default function SigninScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    const result = await AuthService.login(email.toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      Alert.alert("Welcome!", `Hello ${result.data.user.fullName}!`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") }
      ]);
    } else if (result.requiresVerification) {
      Alert.alert(
        "Verification Required",
        "Complete account verification to continue",
        [
          {
            text: "Verify Now",
            onPress: () => {
              router.push({
                pathname: "/(auth)/verify-account",
                params: { email: email.toLowerCase(), option: "Account" }
              });
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[mainStyles.authBackground]}>
        <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
        <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Welcome Back</Text>

        <View style={{ width: "100%", gap: 10 }}>
          <InputElement placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputElement placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <MainButton title={loading ? "Signing in..." : "Signin"} isFullWidth isDark onPress={handleSignin} disabled={loading} />

        {loading && <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />}

        <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>
          Don't have an account? <Link href={"/(auth)/signup"} style={{ color: MainColors["Almost Black"] }}>Signup</Link>
        </Text>
      </View>
    </ScrollView>
  );
}
