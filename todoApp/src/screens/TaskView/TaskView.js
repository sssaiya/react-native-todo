import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./styles";
import { firebase } from "../../firebase/config";

export default function TaskView(props) {
  console.log(`extraData - ` + props.extraData);
  const [entityText, setEntityText] = useState("");

  const entityRef = firebase.firestore().collection("projects");

  const onAddButtonPress = () => {
    if (entityText && entityText.length > 0) {
      const data = props.extraData;
      console.log(data);
      entityRef
        .doc(props.docId)
        .update("tasks", data)
        .then((_doc) => {
          setEntityText("");
          Keyboard.dismiss();
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  const renderProject = ({ item, index }) => (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        margin: 1,
      }}
    >
      <View
        style={{
          backgroundColor: item.color ? item.color : "blue",
          width: "100%",
          height: 100,
        }}
      >
        <Text style={styles.entityText}>{item.text}</Text>
      </View>
    </View>
  );

  const ItemSeparatorLine = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: "100%",
          backgroundColor: "#111a0b",
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new Task"
          placeholderTextColor="#aaaaaa"
          onChangeText={(projectName) => setEntityText(projectName)}
          value={entityText}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={onAddButtonPress}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {props.tasks && (
        <View style={styles.listContainer}>
          <FlatList
            data={props.tasks}
            ItemSeparatorComponent={ItemSeparatorLine}
            renderItem={renderProject}
            //Setting the number of column
            numColumns={2}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
    </View>
  );
}

//Function to get a random color for each new project background
function getRandomColor() {
  var letters = "BCDEF".split("");
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}
