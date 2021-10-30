import {API_PATH, SERVER_API_PORT, CHOICES_API_PATH} from './APIConstants.js'
import express from 'express';
import fs from 'fs'

const INPUT_1 = './inputs/category1.txt'
const INPUT_2 = './inputs/category2.txt'
const OUTPUT_1 = './outputs/client_category1.json'
const OUTPUT_2 = './outputs/client_category2.json'
const FINAL_OUTPUT = './outputs/equivalent_choices.json'

const app = express();

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });


const data1 = fs.readFileSync(INPUT_1, 'utf8')
let category1_to_send = stringToJson(data1.split('\r\n').filter(s => s))
const data2 = fs.readFileSync(INPUT_2, 'utf8')
let category2_to_send = stringToJson(data2.split('\r\n').filter(s => s))

function stringToJson(str_arr){
    let json_array = []
    for (let i = 0; i < str_arr.length; i++){
      let temp_option = {
        id: i,
        name: str_arr[i],
        rating: 0,
      }
      json_array.push(temp_option)
    }
    return json_array
}


function save_client_choices(client_categories){
    const files = [OUTPUT_1, OUTPUT_2]
    //console.log("client categories length:", client_categories.length)
    for (var i = 0; i < client_categories.length; i++) {
        const category = JSON.parse(client_categories[i])
        //console.log(category)
        if (category.length > 1) {
            save_to_file(files[i], category)
        } 
    }
}

function save_to_file(path, array_of_objects) {
    console.log('writing to file', path)
    var logger = fs.createWriteStream(path)
    logger.write('[\n')
    var sep = "";
    array_of_objects.forEach(function(objectToAppend) {
        logger.write(sep + JSON.stringify(objectToAppend))
        if (!sep)
            sep = ",\n";
    });
    logger.write('\n]')
    logger.close()
}

function setCategoryInfo(client_categories){
    let category_client_arr1 = JSON.parse(client_categories[0]) 
    let category_client_arr2 = JSON.parse(client_categories[1])
    if ((category_client_arr1.length > 0) && (category1_to_send !== category_client_arr1)){
        //console.log('we are in 1')
        category1_to_send = category_client_arr1
    }
    if ((category_client_arr2.length > 0) && (category2_to_send !== category_client_arr2)){
        //console.log('we are in 2')
        category2_to_send = category_client_arr2
    }
}

function choisesStringToObjects(equivalent_choices){
    let ec_arr = []
    for (let i = 0; i < equivalent_choices.length; i++){
        //console.log(equivalent_choices[i])
        let temp = JSON.parse(equivalent_choices[i])
        ec_arr.push(temp)
    }
    //console.log('ec_arr', ec_arr)
    return ec_arr
}

app.get(CHOICES_API_PATH, function(req, res){
    const equivalent_choices = req.query.equivalent_choices 
    //console.log('before parse', equivalent_choices)
    save_to_file(FINAL_OUTPUT, choisesStringToObjects(equivalent_choices))
    res.send(equivalent_choices)
})

app.get(API_PATH, function(req, res){
    const client_categories = req.query.client_categories
    if (client_categories){
        save_client_choices(client_categories)
    //console.log('category 1 before changing',category1_to_send)
        setCategoryInfo(client_categories)
    //console.log('category 1 after changing',category1_to_send)
    }
    res.send([category1_to_send, category2_to_send])
})

app.listen(SERVER_API_PORT, function(){
    console.log("express server is running...");
})
