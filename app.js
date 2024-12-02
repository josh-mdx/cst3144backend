const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://cv247:Dh2O6MrGyCOex8Ig@cluster0.jhokv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let db;
let lessonsCollection;
let ordersCollection;

