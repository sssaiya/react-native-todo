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
// import { useNavigation } from "@react-navigation/native";

export default function HomeScreen(props) {
  // const { navigation } = this.props.navigation;
  const navigation = props.navigation;
  const [entityText, setEntityText] = useState("");
  const [projects, setProjects] = useState([]);

  const entityRef = firebase.firestore().collection("projects");
  const userID = props.extraData.id;

  useEffect(() => {
    entityRef
      .where("authorID", "==", userID)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (querySnapshot) => {
          const newProjects = [];
          querySnapshot.forEach((doc) => {
            const entity = doc.data();
            entity.id = doc.id;
            newProjects.push(entity);
          });
          setProjects(newProjects);
        },
        (error) => {
          console.log(error);
        }
      );
  }, []);

  const onAddButtonPress = () => {
    if (entityText && entityText.length > 0) {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const data = {
        text: entityText,
        authorID: userID,
        createdAt: timestamp,
        color: getRandomColor(),
        tasks: []
      };
      entityRef
        .add(data)
        .then((_doc) => {
          setEntityText("");
          Keyboard.dismiss();
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  const renderProject = ({ item, index }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          margin: 1,
        }}
      >
        <TouchableOpacity onPress={() => renderProjectTaskView(item.id)}>
          <View
            style={{
              backgroundColor: item.color ? item.color : "blue",
              width: "100%",
              height: 100,
            }}
          >
            <Text style={styles.entityText}>{item.text}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProjectTaskView = (index) => {
    entityRef
      .doc(index)
      .get()
      .then((docRef) => {
        const tasks = docRef.data().tasks;
        navigation.navigate("TaskView", { tasks: tasks, docId: index });
      })
      .catch((error) => {});
  };

  const GetGridViewItem = ({ item }) => {
    Alert.alert(item);
  };
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
          placeholder="Add new Project"
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
      {projects && (
        <View style={styles.listContainer}>
          <FlatList
            data={projects}
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
