import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from "./views/resultsView.js"
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

import "core-js/stable"
import {async} from "regenerator-runtime/"
import "regenerator-runtime/runtime"
import View from './views/View.js'


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if(module.hot){
//   module.hot.accept()
// }
const controlRecipe = async function(){
  try{
      const id = window.location.hash.slice(1)
      if(!id) return
      recipeView.renderSpinner()

      resultsView.update(model.getSearchResultsPage())
      bookmarksView.update(model.state.bookmarks)
      // Loading Recipe
      await model.loadRecipe(id)

      // Rendering Recipe
      recipeView.render(model.state.recipe)
      
    }catch(err){
    alert(err)
    recipeView.renderError()
  }
}

const controlSearchResults = async function(){
  try{
      resultsView.renderSpinner()
      // Get search query
      const query = searchView.getQuery()
      if(!query) return

      
      // Load search results
      await model.loadSearchResults(query)

      // Render search results
      resultsView.render(model.getSearchResultsPage())

      // Render pagination patterns
      paginationView.render(model.state.search)
  }catch(err){
    console.log(err)
  }
}

const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage))

  paginationView.render(model.state.search)
}

const controlServings = function(newServings){
  // Update the recipe servings
  model.updateServings(newServings)

  // Update the recipe view
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function(){
  // Update bookmark status
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else if(model.state.recipe.bookmarked)  model.deleteBookmark(model.state.recipe.id)
  
  // Update recipe view
  recipeView.update(model.state.recipe)

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
    bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try{
    addRecipeView.renderSpinner()

    await model.uploadRecipe(newRecipe)

    recipeView.render(model.state.recipe)

    addRecipeView.renderMessage()

    bookmarksView.render(model.state.bookmarks)
    
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    setTimeout(function(){
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC)

  }
  catch(err){
    console.error(err)
    addRecipeView.renderError(err.message)
  }
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipe)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}

init()
