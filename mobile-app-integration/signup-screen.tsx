// Updated Signup Screen with API Integration
// Replace your existing signup screen with this

import { useState } from "react";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Link, useRouter } from "expo-router";
import { Image, Text, View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { AuthService } from "@/services/api/authService";

export default function SignupScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const result = await AuthService.register({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      phone: phone.replace(/\s/g, ''),
      password,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success!",
        "Registration successful! Check your email and phone for verification codes.",
        [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/(auth)/verify-account",
                params: {
                  email: email.toLowerCase(),
                  phone: phone.replace(/\s/g, ''),
                  option: "Account"
                }
              });
            }
          }
        ]
      );
    } else {
      let errorMsg = result.error;
      if (result.details) errorMsg += "\n\n" + result.details.join("\n");
      Alert.alert("Registration Failed", errorMsg);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[mainStyles.authBackground]}>
        <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
        <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Create an Account</Text>

        <View style={{ width: '100%', gap: 10 }}>
          <InputElement placeholder="Full Names" value={fullName} onChangeText={setFullName} />
          <InputElement placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputElement placeholder="Phone Number (+250788123456)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <InputElement placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <Text style={[mainStyles.normalText]}>Agree to our <Link href={"/_sitemap"}>terms of services</Link></Text>

        <MainButton title={loading ? "Signing up..." : "Signup"} isFullWidth isDark onPress={handleSignup} disabled={loading} />

        {loading && <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />}

        <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>
          Already have an account? <Link href={"/(auth)/signin"} style={{ color: MainColors["Almost Black"] }}>Signin</Link>
        </Text>
      </View>
    </ScrollView>
  );
}
