import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react'; 

function App() {
 // Stockage de la clé API dans une variable
  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MDFlNmQ3MjZmNDRkZjAwMGE3YTM5NTkiLCJyb2xlIjoiaW50ZXJuIiwiaWF0IjoxNjEyNjA2ODM0fQ.O9k8jI1PvhR4PUr1yjZUwl0Qyi4HMrEEZHno_X_U170";
 // Appel de l'API lors du montage de l'application et stockage des données reçues dans le state "tab"
  useEffect(() => {
    axios.get(`https://doctomoto-intern.appspot.com/intern/exercise/getList?apiKey=${API_KEY}`)
    .then(response => setTab(response.data.partners))
  }, [])

 // State stockant les données brut de l'API
const [tab, setTab] = useState([]);
 // State stockant les dates possibles pour startDate
const [result, setResult] = useState([]);
 // State stockant le tableau de données envoyé par le POST 
const [countries] = useState([]);
 // Variable triant les dates disponibles pour startDate
const possibleDates = [];
 // Variable stockant le nombre de personnes disponibles pour une date donnée
const occurPossibleDates = [];
 // Variable stockant tout les pays de l'API
const countryTab = [];
 // Variable stockant toute les données brut de l'API par pays
const countryTabs = [];

 // Boucle récupérant tout les pays dans les données de l'API et ajoute un tableau par pays dans les variables correspondantes
for(let i = 0; i < tab.length; i++) {
  if(!(countryTab.includes(tab[i].country))) {
    countryTab.push(tab[i].country);
    countryTabs.push([]);
    possibleDates.push([]);
    occurPossibleDates.push([]);
  }
}
 
 // Boucle récupérant les partners pour les stocker dans un tableau correspondant à leurs pays d'origine
for (let i = 0; i < tab.length; i++) {
  if (countryTab.includes(tab[i].country)) {
    countryTabs[countryTab.indexOf(tab[i].country)].push(tab[i])
  }
}

 // Fonction récupérant toute les dates possible pour startDate par pays
const getAllPossible = () => {
  // Boucle récupérant l'ID du pays
  for (let i = 0; i < countryTabs.length; i++) {
    result.push([]);
    // Boucle récupérant l'ID des partners dans le pays correspondant
    for (let j = 0; j < countryTabs[i].length; j++) {
      const dates = countryTabs[i][j].availableDates;
      // Boucle récupérant le tableau de dates disponibles pour le partners correspondant
      for(let k = 0; k < dates.length; k++) {
        if(k !== dates.length) {
           
          // Fonction permettant de vérifier la position de l'index
          const checkK = (el) => {
            if(el === dates.length) {
              return el-1;
            } else {
              return el;
            }
          }
          
          // Récupère la date correspondante à la boucle
          const dateKey = dates[k];
          // Duplique dateKey
          let idK = dates.indexOf(dates[k]);
          // Obtenir l'index + 1
          const kSecond = idK+1;
          // Date correspondant à la date suivante
          const dateKey2 = dates[checkK(kSecond)];
          
          // Permet de savoir si les deux dates se suivent
          const difference = parseInt(dateKey2.slice(-2)) - parseInt(dateKey.slice(-2));
          
          // Si les deux dates se suivent, on les pousse dans la variable correspondante
          if(difference === 1) {
            const temp = [...result];
            temp[i].push(dateKey);
            setResult(temp);
          }
        } 
      }
    }
  }
}

 // Boucle récupérant un exemplaire de chaque date disponible pour startDate dans result
for (let i = 0; i < result.length; i++) {
  for (let j = 0; j < result[i].length; j++) {
    if (!(possibleDates[i].includes(result[i][j]))) {
      possibleDates[i].push(result[i][j]);
    }
  }
}

 // Fonction permettant de récupéré le nombre de partners disponible par date
const getAllStartDate = () => {
  
  // Fonction qui parcours result pour avoir toute les dates de toutes les personnes pour ensuite les comparer avec les valeurs de possibleDates
  const getOccurrence = (array, value) => {
    let count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
}
  // Boucle qui stock le nombre de personnes disponibles pour chaques dates dans occurPossibleDates
  for (let i = 0; i < possibleDates.length; i++) {
    for (let j = 0; j < possibleDates[i].length; j++) {
      occurPossibleDates[i].push(getOccurrence(result[i], possibleDates[i][j]));
    }
  }
}

 // Fonction permettant de créer le tableau du POST
const createPost = () => {

  // Fonction permettant d'obtenir l'index de la date ayant le plus de partners disponible, le plus tôt possible
  const indexOfMax = (arr) => {
    if (arr.length === 0) {
        return -1;
    }
    let max = arr[0];
    let maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
  }

  // Boucle permettant de créer l'objet correspondant à un pays dans le POST
  for(let i = 0; i < occurPossibleDates.length; i++) {
    // Valeur de départ de la variable de country
    let country = {
      "startDate": "",
      "attendeeCount": "",
      "attendees": [],
      "name": countryTab[i],
    };

    // Boucle récupérant chaque partners de chaque pays
    for(let j = 0; j < countryTabs[i].length; j++) {
      
      // Fonction récupérant l'adresse mail de chaque partners disponible pour la startDate
      const tabAttendees = (arr ,value) => {
        
        // Création d'une variable récupérant les valeurs précédantes
        const attendees = [...arr];
        countryTabs[i][j].availableDates.forEach((v) => (v === value && attendees.push(countryTabs[i][j].email)));
        return attendees;
      }

      // Variable permettant de stocker les données en cours de récupération
      const temp = {
        "startDate": possibleDates[i][indexOfMax(occurPossibleDates[i])],
        "attendeeCount": occurPossibleDates[i][indexOfMax(occurPossibleDates[i])],
        "attendees": tabAttendees(country.attendees, possibleDates[i][indexOfMax(occurPossibleDates[i])]),
        "name": countryTab[i],
      };
      
      // Assignation des données récupérées à countrie
      country = temp;
    }
    // On pousse l'objet country dans le tableau countries
    countries.push(country);
  }
}

 // Fonction d'envois du tableau countries
const sendCountries = () => {
  axios.post(
    `https://doctomoto-intern.appspot.com/intern/exercise/sendResult?apiKey=${API_KEY}`,
    {countries: countries}
  )
    .then(response => console.log(response));
}

  return (
    <div className="App">
      <div className="title">Veuillez cliquez sur les boutons dans l'ordre.</div>
      <button type="button" onClick={getAllPossible}>1 - Get all possible startDates by country</button>
      <br />
      <button type="button" onClick={getAllStartDate}>2 - Get all startDate by country</button>
      <br />
      <button type="button" onClick={createPost}>3 - Create Post Form</button>
      <br />
      <button type="button" onClick={sendCountries}>4 - Post Countries</button>
    </div>
  );
}

export default App;
 


