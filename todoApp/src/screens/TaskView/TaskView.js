import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import styles from "./styles";
import { firebase } from "../../firebase/config";
import { Icon } from "react-native-elements";

export default function TaskView({ route, navigation }) {
  let tasks = route.params.tasks;
  const [entityText, setEntityText] = useState("");
  const [tasks, setTasks] = useState(null);

  const entityRef = firebase.firestore().collection("projects");
  const docRef = firebase
    .firestore()
    .collection("projects")
    .doc(route.params.docId);

  useEffect(() => {
    docRef.onSnapshot(
      (querySnapshot) => {
        const newTasks = querySnapshot.data().tasks;
        setTasks(newTasks);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  const onAddButtonPress = () => {
    if (entityText && entityText.length > 0) {
      const newTask = {
        text: entityText,
        color: getRandomColor(),
        isCompleted: false,
      };
      tasks.push(newTask);
      entityRef
        .doc(route.params.docId)
        .update("tasks", tasks)
        .then((_doc) => {
          setEntityText("");
          Keyboard.dismiss();
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  function confirmDelete(item) {
    const title = "Confirm Delete";
    const message = `Delete ${item.text}?`;
    const buttons = [
      {
        text: "Yes",
        onPress: () => deleteproject(item.text),
      },
      {
        text: "No",
        type: "cancel",
      },
    ];
    Alert.alert(title, message, buttons);
  }
  function deleteproject(taskToDelete) {
    let newTasks = [];
    //Make new array with old tasks minus the one to delete

    docRef.get().then((querySnapshot) => {
      console.log(querySnapshot.data().tasks);
      querySnapshot.data().tasks.forEach((task) => {
        if (task.text != taskToDelete) newTasks.push(task);
      });

      //Update db
      docRef.update({ tasks: newTasks });
      settasks(newTasks);
    });
  }

  function completeTask(index) {
    docRef.get().then((snapshot) => {
      let oldtasks = snapshot.data().tasks;
      console.log(oldtasks);
      oldtasks[index].isCompleted = !oldtasks[index].isCompleted;
      docRef.update({ tasks: oldtasks });
      settasks(oldtasks);
    });

    // docRef.update
  }

  const renderTask = ({ item, index }) => (
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
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            margin: 1,
          }}
        >
          <TouchableOpacity
            style={styles.deletebutton}
            onPress={() => confirmDelete(item)}
          >
            <Icon name="delete" color="red"></Icon>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deletebutton}
            onPress={() => editProject(item)}
          >
            <Icon name="edit"></Icon>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deletebutton}
            onPress={() => completeTask(index)}
          >
            <Icon
              name="check"
              color={item.isCompleted ? "green" : "red"}
            ></Icon>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deletebutton}
            onPress={() => editProject(item)}
          >
            <Icon name="calendar"></Icon>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 3,
            flexDirection: "column",
            margin: 1,
          }}
        >
          <Text style={styles.entityText}>{item.text}</Text>
        </View>
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
      {tasks && (
        <View style={styles.listContainer}>
          <FlatList
            data={tasks}
            ItemSeparatorComponent={ItemSeparatorLine}
            renderItem={renderTask}
            //Setting the number of column
            numColumns={1}
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
