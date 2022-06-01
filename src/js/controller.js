import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import { async } from 'regenerator-runtime';
if (module.hot) {
  module.hot.accept();
}

/**
 * 控制菜单相关状态
 * @returns {Promise} 展示菜单
 * @callback recipeView.renderErr 如果发生错误, 展示错误信息
 */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // 0) 标记为选中
    resultsView.update(model.getSearchResultsPage());

    // 1) 更新书签
    bookmarksView.update(model.state.bookmarks);

    // 2）获取菜单并加载菜单
    // 从module中获取数据，loadRecipe是一个async function,所以需要await
    await model.loadRecipe(id);

    // 3) 填入数据,并展示菜单
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderErr(`${err}💥💥💥💥`);
  }
};

/**
 * 控制搜索功能
 * @returns {Promise}
 */
const controlSearch = async function () {
  try {
    // 1）获取搜索内容
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    // 2）加载搜索结果
    await model.loadSearchResult(query);

    // 3）展示搜索结果
    resultsView.render(model.getSearchResultsPage());

    // 4) 初始化分页器
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

/**
 * 控制分页器
 * @param {number} goToPage 当前页面
 */
const controlPagination = function (goToPage) {
  // 1）展示新页面
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) 展示新的分页器
  paginationView.render(model.state.search);
};

/**
 *  控制用餐人数变动
 * @param {number} newServings 当前用餐人数
 */
const controlServings = function (newServings) {
  // 1）更新state里面的recipe serving数据
  model.updateServings(newServings);

  // 2）更新recipe view
  recipeView.update(model.state.recipe);
};

/** 控制添加书签的功能 */
const controlAddBookmark = function () {
  // 1）增添书签
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);

  // 2）更新菜单页面
  recipeView.update(model.state.recipe);

  // 3）展示菜单
  bookmarksView.render(model.state.bookmarks);
};

/**
 * 控制书签相关菜单展示
 */
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

/**
 * 控制添加菜单的功能
 * @param {Recipe} newRecipe  用户上传的菜单数据
 * @callback addRecipeView.renderErr 如果添加失败，展示错误信息
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    // 0) 加载
    addRecipeView.renderSpinner();

    // 1）上传菜单
    await model.uploadRecipe(newRecipe);

    // 2）展示菜单
    recipeView.render(model.state.recipe);

    // 3) 添加成功的提示
    addRecipeView.renderMessage();

    // 4）展示书签
    bookmarksView.render(model.state.bookmarks);

    // 5) 更新id 和 url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 5) 关闭表单
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderErr(err.message);
  }
};

/**
 * 初始化各项功能
 * @description subscriber,和view链接
 */
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearch);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
