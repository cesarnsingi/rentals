import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer }          from '@react-navigation/native';
import { createBottomTabNavigator }     from '@react-navigation/bottom-tabs';
import { createStackNavigator }         from '@react-navigation/stack';
import { Ionicons }                     from '@expo/vector-icons';
import { COLORS }                       from '../constants';

// Screens
import HomeScreen           from '../screens/HomeScreen';
import ListingsScreen       from '../screens/ListingsScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import { FavoritesScreen }  from '../screens/FavoritesScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import AuthScreen           from '../screens/AuthScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Home Stack (Home → Listings → Detail) ────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain"      component={HomeScreen} />
      <Stack.Screen name="Listings"      component={ListingsScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Listings Stack ────────────────────────────────────────────────────────────
function ListingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListingsMain"   component={ListingsScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Favorites Stack ───────────────────────────────────────────────────────────
function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesMain"  component={FavoritesScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="Auth"           component={AuthScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

// ── Profile Stack ─────────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Auth"        component={AuthScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, [string, string]> = {
  Home:      ['home',        'home-outline'       ],
  Browse:    ['search',      'search-outline'     ],
  Favorites: ['heart',       'heart-outline'      ],
  Profile:   ['person',      'person-outline'     ],
};

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const [active, inactive] = TAB_ICONS[name] ?? ['help', 'help-outline'];
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons
        name={(focused ? active : inactive) as any}
        size={22}
        color={focused ? COLORS.gold : COLORS.gray3}
      />
    </View>
  );
}

function TabBarLabel({ name, focused }: { name: string; focused: boolean }) {
  const labels: Record<string, string> = { Home: 'Início', Browse: 'Explorar', Favorites: 'Guardados', Profile: 'Perfil' };
  return <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{labels[name] ?? name}</Text>;
}

// ── Root navigator ────────────────────────────────────────────────────────────
export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown:       false,
          tabBarStyle:       styles.tabBar,
          tabBarShowLabel:   true,
          tabBarIcon:        ({ focused }) => <TabBarIcon name={route.name} focused={focused} />,
          tabBarLabel:       ({ focused }) => <TabBarLabel name={route.name} focused={focused} />,
          tabBarItemStyle:   styles.tabItem,
        })}
      >
        <Tab.Screen name="Home"      component={HomeStack}      />
        <Tab.Screen name="Browse"    component={ListingsStack}  />
        <Tab.Screen name="Favorites" component={FavoritesStack} />
        <Tab.Screen name="Profile"   component={ProfileStack}   />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:    COLORS.bg1,
    borderTopColor:     COLORS.border,
    borderTopWidth:     1,
    height:             82,
    paddingBottom:      16,
    paddingTop:         8,
    elevation:          0,
    shadowOpacity:      0,
  },
  tabItem: {
    gap: 3,
  },
  tabIcon: {
    width:             36,
    height:            36,
    borderRadius:      10,
    alignItems:        'center',
    justifyContent:    'center',
  },
  tabIconActive: {
    backgroundColor:   COLORS.goldBg,
  },
  tabLabel: {
    fontSize:          10,
    color:             COLORS.gray3,
    fontWeight:        '500',
    letterSpacing:     0.2,
  },
  tabLabelActive: {
    color:             COLORS.gold,
    fontWeight:        '600',
  },
});
