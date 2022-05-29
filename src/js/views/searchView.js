class SearchView {
  _parenEl = document.querySelector('.search');
  // 获取输入字符串
  getQuery() {
    const query = this._parenEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parenEl.querySelector('.search__field').value = '';
  }
  // publisher
  addHandlerSearch(handler) {
    this._parenEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
