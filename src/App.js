import React, { useEffect, useState } from 'react';
import { Alert, Text, Modal, View, Keyboard } from 'react-native';
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

  const [VisibleModal, setVisibleModal] = useState(false);
  const [DisableActions, setDisableActions] = useState(false);

  useEffect(() => {
    createDatabase();
    getLocation();
  }, []);
  
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

  async function sincAnnotations(){
    setVisibleModal(true);
    setDisableActions(true);
    let status = 0;
    const NoSincs = await DatabaseServices.findAllSinc();
    
    for (let index = 0; index < NoSincs._array.length; index++) {
      const response = await api.post('email_key=matheusollenascimento@gmail.com', {
        latitude: NoSincs._array[index].latitude,
        longitude: NoSincs._array[index].longitude,
        annotation: NoSincs._array[index].annotation,
        datetime: NoSincs._array[index].date
      });
  
      if(response.data.status !== "success"){
        status = 1;
      }else{
        const id = NoSincs._array[index].id;
        await DatabaseServices.updateAnnotation(id);
      }
    }
    getAnnotations();
    setVisibleModal(false);
    setDisableActions(false);
    if(status !== 0){
      Alert.alert("Erro","Alguns dados não foram sincronizados, tente novamente!");
    }
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
            key={Annotation.id}
            image={Annotation.sinc === 1 ? pointGray : pointGreen}
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
          editable={DisableActions === true ? false : true}
        />
      </View>

      <View style={styles.viewButtons}>

        <TouchableOpacity style={styles.button} onPress={saveAnnotation} disabled={DisableActions}>
          <Text style={styles.buttonText}>INSERIR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={sincAnnotations} disabled={DisableActions}>
          <Text style={styles.buttonText}>SINCRONIZAR DADOS</Text>
        </TouchableOpacity>
      
      </View>
      
      <View style={styles.centeredView}>
        <Modal animationType="slide" transparent={true} visible={VisibleModal}>
          <View style={styles.modalView}>
          <Text>Por favor, aguarde...</Text>
          <Text>Estamos sincronizando seus dados...</Text>
          </View>
        </Modal>
    </View>

    </View>
  );
}
