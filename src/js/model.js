import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { getJSON, sendJSON } from './helper.js';
import { AJAX } from './helper.js';

/**
 * 类型，用来存放所有数据
 * @typedef State
 * @property  {Recipe}  recipe  菜单数据
 * @property  {object}  search  搜索相关的数据
 * @property  {string}  search.query  输入的搜索字符串
 * @property  {object[]}  search.results  搜索结果
 * @property  {number}  search.resultsPerPage 每页展示的搜索结果条目数量
 * @property  {number}  search.page 当前所在页码号
 * @property  {object[]}  bookmarks 书签数据
 */

/**
 * 变量，应用的所有数据
 * @type  State
 */
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

/**
 * 类型，菜单数据
 * @typedef Recipe
 * @property  {number} id 菜单的id
 * @property  {string} title 菜单标题
 * @property  {string} publisher 菜单发布者
 * @property  {string} sourceUrl
 */

/**
 * 函数，创建菜单对象
 * @param {object} data  传入的菜单数据
 * @returns {Recipe}  返回创建好的菜单对象
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe }),
  };
};

/**
 *  函数，加载菜单详情页面
 * @param {number} id 菜单的id
 * @returns {Promise} 返回基于此菜单id创建的菜单对象
 */

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmark = false;
  } catch (err) {
    throw err;
  }
};

/**
 * 函数，加载搜索结果
 * @param {string} query 输入的搜索字符串
 * @returns {Promise<Object>} 返回搜索到的菜单数据
 */
export const loadSearchResult = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // 将搜索结果创建新object
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

/**
 * 函数，计算搜索结果的页数
 * @param {number} page 总页数
 * @returns
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookMark = function (recipe) {
  // 添加书签
  state.bookmarks.push(recipe);

  // 标记为已添加书签
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookMark = function (id) {
  // 删除书签
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // 移除当前标记状态
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// for debuging
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error('Wrong ingredien format! Please try again');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
  } catch (err) {
    throw err;
  }
};
