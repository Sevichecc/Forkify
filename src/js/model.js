// @ts-check
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
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
 * 应用的所有数据
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
 * @property  {string}  id 菜单的id
 * @property  {string}  title 菜单标题
 * @property  {string}  publisher 菜单来源
 * @property  {string}  sourceUrl 来源网址
 * @property  {string}  image 图片网址
 * @property  {number}  servings  用餐人数
 * @property  {number}  cookingTime 烹饪时间
 * @property  {object}  ingredients 烹饪材料
 * @property  {boolean} bookmarked  是否已加入书签
 */

/**
 * 创建菜单对象
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

    // 将额外的参数自动展开加入recipe object中
    ...(recipe.key && { key: recipe }),
  };
};

/**
 * 加载菜单详情页面
 * @param {string} id 菜单的id
 * @returns {Promise<Recipe>} 返回基于此菜单id创建的菜单对象
 * @throws 如果无法加载，就抛出一个错误
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

/**
 * 加载搜索结果
 * @param {string} query 输入的搜索字符串
 * @returns {Promise<Recipe>} 返回搜索到的菜单数据
 * @throws 如果无法加载，就抛出一个错误
 */
export const loadSearchResult = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // 将搜索结果创建新 Recipe object
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
 * 计算搜索结果的页数
 * @param {number} page 总页数
 * @see loadSearchResult
 * @returns {Recipe} 返回搜索到的菜单数据（部分）与 loadSearchResult里返回的数据结构相同
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

/**
 * 更新用餐人数
 * @param {number} newServings 更新后的用餐人数
 */
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

/** 存储书签数据到 localStorage*/
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * 添加书签
 * @param {Recipe} recipe 已添加书签的菜单数据
 */
export const addBookMark = function (recipe) {
  // 添加书签数据
  state.bookmarks.push(recipe);

  // 标记为已添加书签
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

/**
 * 删除书签
 * @param {string} id 需要删除的书签的id
 */
export const deleteBookMark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // 移除当前标记状态
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

/** 初始化书签 */
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

/** for debuging */
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

/**
 * 上传菜单
 * @param {Recipe} newRecipe 用户上传的菜单数据
 * @returns {Promise} 处理好的菜单数据
 * @throws 如果创建失败，抛出一个错误
 */
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
