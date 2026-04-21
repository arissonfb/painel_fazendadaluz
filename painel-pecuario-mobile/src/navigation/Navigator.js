import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

import DashboardScreen from "../screens/DashboardScreen";
import ReproducaoScreen from "../screens/ReproducaoScreen";
import ReproducaoFormScreen from "../screens/ReproducaoFormScreen";
import SanitarioScreen from "../screens/SanitarioScreen";
import SanitarioFormScreen from "../screens/SanitarioFormScreen";
import MovimentacoesScreen from "../screens/MovimentacoesScreen";
import MovimentacaoFormScreen from "../screens/MovimentacaoFormScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabBarStyle = {
  backgroundColor: colors.card,
  borderTopColor: "transparent",
  borderTopWidth: 0,
  height: 74,
  paddingBottom: 10,
  paddingTop: 8,
  position: "absolute",
  left: 12,
  right: 12,
  bottom: 12,
  borderRadius: 24,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 18,
  elevation: 12,
};

const tabBarLabelStyle = {
  fontSize: 11,
  fontWeight: "600",
};

function ReproducaoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReproducaoList" component={ReproducaoScreen} />
      <Stack.Screen name="ReproducaoForm" component={ReproducaoFormScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}

function SanitarioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SanitarioList" component={SanitarioScreen} />
      <Stack.Screen name="SanitarioForm" component={SanitarioFormScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}

function MovimentacoesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovimentacoesList" component={MovimentacoesScreen} />
      <Stack.Screen name="MovimentacaoForm" component={MovimentacaoFormScreen} options={{ presentation: "modal" }} />
    </Stack.Navigator>
  );
}

export default function Navigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarLabelStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: "home",
            Reproducao: "heart-circle",
            Sanitario: "medkit",
            Movimentacoes: "swap-horizontal",
            Perfil: "person-circle",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: "Início" }} />
      <Tab.Screen name="Reproducao" component={ReproducaoStack} options={{ tabBarLabel: "Reprodução" }} />
      <Tab.Screen name="Sanitario" component={SanitarioStack} options={{ tabBarLabel: "Sanitário" }} />
      <Tab.Screen name="Movimentacoes" component={MovimentacoesStack} options={{ tabBarLabel: "Moviment." }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarLabel: "Perfil" }} />
    </Tab.Navigator>
  );
}
