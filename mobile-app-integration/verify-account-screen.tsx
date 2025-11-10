// Updated Verify Account Screen with API Integration
// Replace your existing verify-account screen with this

import { useState, useEffect } from "react";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { View, Image, Text, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthService } from "@/services/api/authService";

export default function VerifyAccountScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const email = params.email as string;
  const phone = params.phone as string;

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  useEffect(() => {
    if (emailCooldown > 0) setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown > 0) setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
  }, [phoneCooldown]);

  const handleVerifyEmail = async () => {
    if (emailCode.length !== 6) {
      Alert.alert("Error", "Enter 6-digit code");
      return;
    }

    setLoading(true);
    const result = await AuthService.verifyEmail(email, emailCode);
    setLoading(false);

    if (result.success) {
      setEmailVerified(true);
      Alert.alert("Success!", "Email verified!");

      if (result.data.fullyVerified) {
        Alert.alert("Account Verified!", "You can now start using the app!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      }
    } else {
      Alert.alert("Failed", result.error);
      setEmailCode("");
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneCode.length !== 6) {
      Alert.alert("Error", "Enter 6-digit code");
      return;
    }

    setLoading(true);
    const result = await AuthService.verifyPhone(phone, phoneCode);
    setLoading(false);

    if (result.success) {
      setPhoneVerified(true);
      Alert.alert("Success!", "Phone verified!");

      if (result.data.fullyVerified) {
        Alert.alert("Account Verified!", "You can now start using the app!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      }
    } else {
      Alert.alert("Failed", result.error);
      setPhoneCode("");
    }
  };

  const handleResendEmail = async () => {
    if (emailCooldown > 0) return;
    
    const result = await AuthService.resendEmailCode(email);
    if (result.success) {
      setEmailCooldown(60);
      Alert.alert("Success!", "New code sent to email");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const handleResendPhone = async () => {
    if (phoneCooldown > 0) return;
    
    const result = await AuthService.resendPhoneCode(phone);
    if (result.success) {
      setPhoneCooldown(60);
      Alert.alert("Success!", "New code sent to phone");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <View style={[mainStyles.authBackground, { gap: 30 }]}>
      <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
      <Text style={[mainStyles.authTitles, { marginTop: -50 }]}>Verify your Account</Text>

      <Text style={[mainStyles.normalText, { textAlign: "center" }]}>
        Codes sent to:{"\n"}📧 {email}{"\n"}📱 {phone}
      </Text>

      {/* Email Verification */}
      <View style={{ width: "100%", gap: 10 }}>
        <Text style={[mainStyles.normalText, { fontWeight: "bold" }]}>
          Email Code {emailVerified && "✅"}
        </Text>
        <InputElement placeholder="6-digit email code" value={emailCode} onChangeText={setEmailCode} keyboardType="number-pad" maxLength={6} editable={!emailVerified} />
        {!emailVerified && (
          <>
            <MainButton title={loading ? "Verifying..." : "Verify Email"} isFullWidth isDark onPress={handleVerifyEmail} disabled={loading || emailCode.length !== 6} />
            <TouchableOpacity onPress={handleResendEmail} disabled={emailCooldown > 0}>
              <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>
                {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend Email Code"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Phone Verification */}
      <View style={{ width: "100%", gap: 10 }}>
        <Text style={[mainStyles.normalText, { fontWeight: "bold" }]}>
          Phone Code {phoneVerified && "✅"}
        </Text>
        <InputElement placeholder="6-digit phone code" value={phoneCode} onChangeText={setPhoneCode} keyboardType="number-pad" maxLength={6} editable={!phoneVerified} />
        {!phoneVerified && (
          <>
            <MainButton title={loading ? "Verifying..." : "Verify Phone"} isFullWidth isDark onPress={handleVerifyPhone} disabled={loading || phoneCode.length !== 6} />
            <TouchableOpacity onPress={handleResendPhone} disabled={phoneCooldown > 0}>
              <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>
                {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : "Resend Phone Code"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />}
    </View>
  );
}
