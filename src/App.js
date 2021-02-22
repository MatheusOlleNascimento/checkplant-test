import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import DatabaseServices from './services/databaseServices';
import DatabaseInit from './database/databaseInit';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import styles from './styles';
import pointGreen from './assets/pointGreen.png';
import pointGray from './assets/pointGray.png';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';

import api from './services/api';

export default function App() {
  
  //Variáveis
  const [InitialRegion, setInitialRegion] = useState({
    latitude: 49.2576508,
    longitude: -123.2639868,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  const [Region, setRegion] = useState({
    latitude: 49.2576508,
    longitude: -123.2639868,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  
  const [Annotations, setAnnotations] = useState([]);
  const [Annotation, setAnnotation] = useState("");

  useEffect(() => {
    createDatabase();
    getLocation();
  }, []);

  async function createDatabase(){
    const database = await AsyncStorage.getItem('DatabaseExist');
    if(database != 'true'){
      new DatabaseInit;
      await AsyncStorage.setItem('DatabaseExist', 'true');}
    getAnnotations();
  };

  async function getLocation(){
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão negada!');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.010,
      longitudeDelta: 0.010,
    })
  }

  async function getAnnotations(){
    const All = await DatabaseServices.findAll();
    setAnnotations(All._array);
  }

  function getDateNow(){
    
    var date = new Date().getDate();
    if(date < 10){
      date = "0" + date;
    }
    var month = new Date().getUTCMonth();
    if(month < 10){
      month = "0" + month;
    }
    var year = new Date().getFullYear();
    var hours = new Date().getHours();
    if(hours < 10){
      hours = "0" + hours;
    }
    var minutes = new Date().getUTCMinutes();
    if(minutes < 10){
      minutes = "0" + minutes;
    }
    var seconds = new Date().getUTCSeconds();
    if(seconds < 10){
      seconds = "0" + seconds;
    }

    var fulldate = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    return fulldate;

  }

  async function saveAnnotation(){

    Keyboard.dismiss();
    Alert.alert("Sucesso","Anotação inserida!");
    setAnnotation("");

    const location = await Location.getCurrentPositionAsync({});
    const date = getDateNow();
    
    const annotation = {longitude: location.coords.longitude, latitude:location.coords.latitude, annotation: Annotation, sinc: 0, date: date};
    const add = DatabaseServices.addAnnotation(annotation);
    if(add==null || add==undefined){
      Alert.alert("Erro","Houve um problema ao inserir sua última anotação!")
    }
    getAnnotations();
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={Region}
        initialRegion={InitialRegion}
      >
      {Annotations.map((Annotation) => (
          <Marker
            image={Annotations.sinc === 1 ? pointGray : pointGreen}
            calloutAnchor={{
              x: 2.9,
              y: 0.8,
            }}
            coordinate={{
              latitude: Number(Annotation.latitude),
              longitude: Number(Annotation.longitude),
            }}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutDate}>{Annotation.date}</Text>
                <Text style={styles.calloutAnnotation}>{Annotation.annotation}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <TextInput
          placeholder={"Digite sua anotação aqui"}
          multiline={true}
          numberOfLines={3}
          style={styles.footerText}
          onChangeText={setAnnotation}
          value={Annotation}
        />
      </View>

      <View style={styles.viewButtons}>

        <TouchableOpacity style={styles.button} onPress={saveAnnotation}>
          <Text style={styles.buttonText}>INSERIR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>SINCRONIZAR DADOS</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}
