import { Component, OnInit, ViewChild } from '@angular/core';
import {GetRecipeService} from '../services/get-recipe.service';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { Meal } from '../interfaces/meal';
import { Filter } from '../interfaces/filter';
import { Favourite } from '../interfaces/favourite';

import { IonModal, ModalController, LoadingController } from '@ionic/angular';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
}) 
export class HomePage implements OnInit{
  @ViewChild(IonModal) modal!: IonModal;
  


  message = '';
  recipes:any[]=[]; 
  sortedRecipes:Meal[]=[];
  nutrients:any; 
  query = String(""); 
  ingredients = String(""); 
  index:any = 0; 
  setLoaded: Boolean = false; 
  btnColor: any = {
  'background': 'lightgray'}; 
  rawNutrients:any[]=[]; 
  filterActive:Boolean = false; 
  filter:any; 
  servingSize:any[]=[]; 
  isQuery: Boolean = true;
  
  showSuccessMessage = Boolean(); 

  filterOps: Filter = {
    query:"",
    ingredients:"",
    maxCals:"",
    maxCarbs:"",
    maxFat:"",
    minProtein:"",
    minCarbs:"",
    cuisine:"",
    diet:[],
    type:"",
    intolerances:[], 
  }
  cuisines: String[]= ['African','Asian','American','British','Cajun','Caribbean',
  'Chinese','Eastern European','European','French','German','Greek','Indian','Irish',
  'Italian','Japanese','Jewish','Korean','Latin American','Mediterranean','Mexican',
  'Middle Eastern','Nordic','Southern','Spanish','Thai','Vietnamese']

  diets: String[]= ['Gluten Free', 'Ketogenic','Vegetarian','Lacto-Vegetarian', 
  'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Low FODMAP', 'Whole30'];

  intolerances: String[]=['Dairy','Egg','Gluten','Grain','Peanut','Seafood','Sesame',
  'Shellfish','Soy','Sulfite','Tree Nut','Wheat'];

  mealType: String[]=['main course','side dish','dessert','appetizer','salad','bread',
  'breakfast','soup','beverage','sauce','marinade','fingerfood','snack','drink'];


  constructor(private getter: GetRecipeService, private router:Router, private modalController: ModalController, private database: DatabaseService, private loadingController: LoadingController) {}

  ngOnInit(){
    let temp = sessionStorage.getItem('recipes');
    let temp2 = sessionStorage.getItem('nutrients');
    let temp3 = sessionStorage.getItem('servingSize'); 
    if(temp && temp2){
      this.setLoaded = true; 
      this.sortedRecipes = JSON.parse(temp); 
      this.rawNutrients = JSON.parse(temp2); 
      this.servingSize = JSON.parse(temp3!); 
    }
  }
  getRecipe(){
    sessionStorage.clear(); 
    this.recipes = [];
    this.sortedRecipes = []; 
    this.rawNutrients = [];
    this.servingSize = [];     
    this.getter.getRecipe(this.query).subscribe(
      async (response) => {
        if (!response.error) {
         this.recipes = response.results; 
         this.recipeSorter(); 
        } else {
          console.error('Error:', response.error); 
        }
      },
      (err) => {
        console.error('Observer got an error:', err); // Log the general error
      }
    );
  }
  login(){
    this.router.navigateByUrl('/login'); 
  }
  nav(id:Number){
    this.router.navigateByUrl('/recipe/'+id, {replaceUrl:true}); 
  }
  recipeSorter(){
    this.rawNutrients = []; 
    this.sortedRecipes = []; 
    this.recipes.forEach(e => {
      let prot = 0;
      this.nutrients = e.nutrition.nutrients;    
      if(String(this.nutrients[8].name == "Alcohol" ) && String(this.nutrients[9].name) == "Protein"){
        prot = this.nutrients[9].amount; 
        console.log(this.nutrients[8].name, this.nutrients[8].amount, this.nutrients[9].name, this.nutrients[9].amount)
      }
      else if(String(this.nutrients[8].name == "Protein") && String(this.nutrients[9].name) != "Protein"){
        prot = this.nutrients[8].amount; 
      }
      let entry:Meal = {
        id: e.id ?? "",
        title: e.title ?? "",
        cals: String(this.nutrients[0].amount ?? ""),
        carbs: String(this.nutrients[4].amount ?? ""),
        protein: String(prot),
        fat: String(this.nutrients[1].amount ?? ""),
        diet: e.diets ?? "",
        image: e.image ?? ""
      }
      this.sortedRecipes.push(entry); 
      this.servingSize.push(e.nutrition.weightPerServing ?? ""); 
      let a =  e.nutrition.nutrients;
      this.rawNutrients.push(a); 
    });
    if(this.sortedRecipes[0]){
      this.setLoaded = true; 
      let x = JSON.stringify(this.sortedRecipes); 
      let y = JSON.stringify(this.rawNutrients);
      let z = JSON.stringify(this.servingSize);
      sessionStorage.setItem('nutrients', y); 
      sessionStorage.setItem('recipes',x); 
      sessionStorage.setItem('servingSize',z); 
      
    } else {
      sessionStorage.removeItem('recipes'); 
      this.message = "Sorry, we couldn't find any recipes matching that criteria. Remove / Alter the current filter to get more results"; 
    }

  } 
  
  // Navigate through recipes.
  slideNav(step:number){
    if(this.setLoaded){
      // Loops around if edges reached.
      if(this.index == this.sortedRecipes.length -1 && step > 0) {
        this.index = 0;
      } else if(this.index == 0 && step < 0) {
        this.index = this.sortedRecipes.length - 1;
      } else {
        this.index += step;
      }
    }
  }
  colorChange(){
    if(this.query.length >= 2){
      this.btnColor['background'] = 'radial-gradient(100% 100% at 100% 0%, #ffdc30 0%, #FF6700 100%)'; 
    } else {
      this.btnColor['background'] = 'lightgray'; 
    }
  }
  gradientChange(){
    if(this.query.length >= 2){
      this.btnColor['background']='radial-gradient(100% 100% at 0% 100%, #ffdc30 0%, #FF6700 100%)'; 
     }
  }

  revertColorChange(){
     if(this.query.length <= 1){
    this.btnColor['background']='lightgray'; 
     }else {
      this.btnColor['background'] = 'radial-gradient(100% 100% at 100% 0%, #ffdc30 0%, #FF6700 100%)'; 
     }
  }
  // Styling for loading box. Appears when user presses "APPLY" recipe filter.
  async presentLoading() {
    console.log('starting loading');
     const loading = await this.loadingController.create({
      spinner: 'circles',
      keyboardClose: true,
      message: 'Finding Your Recipes...'
    });
    return await loading.present();
  }

  // Api call to fetch and set recipe data. 
  async sendFilterData() {
    try {
      await this.presentLoading(); // start loader

      console.log(this.filterOps);
      this.getter.applyFilter(this.filterOps).subscribe(
        async (response) => {
          if (!response.error) {
            this.recipes = [];
            this.sortedRecipes = [];
            this.recipes = response.results;
            console.log(this.recipes);
            console.log("melon");
            this.recipeSorter();
          } else if (this.recipes.length === 0) {
            this.message = "Sorry, we couldn't find any recipes matching that criteria. Remove / Alter the current filter to get more results";
          } else {
            console.error('Error:', response.error);
          }
        },
        (err) => {
          console.error('Observer got an error:', err); // Log the general error
        }
      );
    } finally {
      this.loadingController.dismiss();
    }
  }
  
  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }
  //TOGGLE FUNC
  changeSearchType() {
    if(this.isQuery){
    this.isQuery = false; 
    } else {
      this.isQuery = true; 
    }
    console.log(this.isQuery); 
  }
  reset(){
    this.setLoaded = !this.setLoaded;
  }

  async newFav(fav: Meal) {
    fav = this.sortedRecipes[this.index]; 
    let newFav:Favourite = {
      id: fav.id,
      name: fav.title,
      pictureLink: fav.image
    }
    try {
      const isSuccess = await this.database.addFavourite(newFav);
      if (isSuccess) {
        this.showSuccessMessage = true; // Display success message
        setTimeout(() => {
          this.showSuccessMessage = false; // Hide success message after a delay
        }, 3000); // Adjust the delay (in milliseconds) as needed
      } else {
        // Handle cases where addFavourite returns false
        // Optional: Display an error message or perform other actions
      }
    } catch (error) {
      console.error('Error adding favourite:', error);
      // Handle error scenarios here
    }

   
  }
}
