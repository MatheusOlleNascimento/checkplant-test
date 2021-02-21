import { Dimensions, StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  
  calloutContainer: {
    minWidth: 120,
    height: "100%",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 5,
    justifyContent: "center",
    elevation: 5,
  },

  calloutDate: {
    color: "#385454",
    fontSize: 12,
  },

  calloutAnnotation: {
    color: "#385454",
    fontSize: 14,
  },

  footer: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 135,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    elevation: 5,
  },

  viewButtons: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#72B177",
    borderRadius: 5,
    height: 45,
    elevation: 5,
    marginVertical:5
  },

  buttonText: {
    color: "#FFF",
  },

  footerText: {
    color: "#8fa7b3",
  },

});