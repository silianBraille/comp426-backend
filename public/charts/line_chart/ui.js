import { LineChart } from "./line_chart_segmented.js";
import { createAccount, loginAccount, statusAccount, getData, getPrivateData, postPrivateData } from "../../requests.js";

let chart = null;
let dataset = {};
let username = "";
let password = "";
let current_task = "";
const chart_container = document.querySelector(`section#chart`);

window.onload = async function init() {
  /* set event handlers */
  document.getElementById("login").addEventListener("click", login_prompt);
}

function list_keys (data, container) {
  let fieldset = document.createElement(`fieldset`);
  fieldset.id = `dataline_selector`;
  fieldset.addEventListener(`click`, show_selected_datalines, true);

  let legend = document.createElement(`legend`);
  legend.appendChild(document.createTextNode(`Select data lines to highlight:`));
  fieldset.appendChild(legend);

  for (const series in dataset) {
    if (`label` !== series) { 
      let series_checkbox = create_checkbox(`checkbox-${series}`, series, series);
      // fieldset.appendChild(checkbox);

      let series_fieldset = document.createElement(`fieldset`);
      series_fieldset.classList.add(`series_fieldset`);
      let series_legend = document.createElement(`legend`);
      series_legend.appendChild(series_checkbox);
      series_fieldset.appendChild(series_legend);

      for (let s = 1, s_len = dataset[series].length; s_len > s; ++s) {
        let seg_id = `${series}-segment_${s}`;
        let index_checkbox = create_checkbox(`checkbox-${seg_id}`, seg_id, s);
        series_fieldset.appendChild(index_checkbox);
      }    
      fieldset.appendChild(series_fieldset);
    }
  }

  container.appendChild(fieldset);

  const hide_checkbox = create_checkbox(`checkbox-hide_datalines`, `hide_datalines`, `hide unselected datalines`);
  hide_checkbox.addEventListener(`click`, show_selected_datalines, true);

  container.appendChild(hide_checkbox);
}

function create_checkbox (id, value, label_text) {
  let checkbox = document.createElement(`input`);
  checkbox.type = `checkbox`;
  checkbox.name = label_text;
  checkbox.value = value;
  checkbox.id = id;

  let label = document.createElement(`label`)
  label.htmlFor = id;
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(label_text));

  return label;
}

function show_selected_datalines (event) {
  // const fieldset = event.currentTarget;
  const fieldset = document.getElementById(`dataline_selector`);
  var checked_list = fieldset.querySelectorAll(`input:checked`);

  let selected_ids = [];
  for (let input of checked_list) {
    selected_ids.push(input.value);
  }

  const hide_checkbox = document.getElementById(`checkbox-hide_datalines`);

  chart.hilite_by_id(selected_ids, hide_checkbox.checked);

  chart.hilite_segments_by_id(selected_ids);
}

async function send_yes() {
  if(document.cookie.slice(0,3)=="jwt") {
    await postPrivateData(location.hostname, location.port, `user/labels/${current_task}`, 1, document.cookie.slice(4));
    current_task = (await getPrivateData(location.hostname, location.port, "user/tasks", 1, document.cookie.slice(4)))["data"]["result"];

    await getData(location.hostname, location.port, `public/samples/${current_task}`, 1).then((val) => {
      dataset = {current_task: val["data"]["result"]};
    });

    chart_container.innerHTML = ``;

    chart = new LineChart(dataset, chart_container, 1800, 300);
  }
}

async function send_no() {
  if(document.cookie.slice(0,3)=="jwt") {
    await postPrivateData(location.hostname, location.port, `user/labels/${current_task}`, 0, document.cookie.slice(4));
    current_task = (await getPrivateData(location.hostname, location.port, "user/tasks", 1, document.cookie.slice(4)))["data"]["result"];

    await getData(location.hostname, location.port, `public/samples/${current_task}`, 1).then((val) => {
      dataset = {current_task: val["data"]["result"]};
    });

    chart_container.innerHTML = ``;

    chart = new LineChart(dataset, chart_container, 1800, 300);
  }
}

async function login_prompt() {
  /*jwt saved in document.cookie.slice(4)*/
  username = prompt("Enter username");
  password = prompt("Enter password");
  await loginAccount(location.hostname, location.port, username, password);
  current_task = (await getPrivateData(location.hostname, location.port, "user/tasks", 1, document.cookie.slice(4)))["data"]["result"];

  await getData(location.hostname, location.port, `public/samples/${current_task}`, 1).then((val) => {
    dataset = {current_task: val["data"]["result"]};
  });

  chart = new LineChart(dataset, chart_container, 1800, 300);

  document.getElementById("yes").addEventListener("click", send_yes);
  document.getElementById("no").addEventListener("click", send_no);
}
