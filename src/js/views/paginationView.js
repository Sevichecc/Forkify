import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      // 因为可能点到的是button内部的元素，所以要往上找最近的parent element
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
  _generateMarkup() {
    const curPage = this._data.page;
    const numPage = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page1，and there are other pages
    if (curPage === 1 && numPage > 1)
      return this._generateMarkupBtnNext(curPage);

    // Last page
    if (curPage === numPage && numPage > 1)
      return this._generateMarkupBtnPre(curPage);

    // Other page
    if (curPage < numPage)
      return this._generateMarkupBtnNext(curPage).concat(
        this._generateMarkupBtnPre(curPage)
      );

    // Page1, and there are No other pages
    return '';
  }

  _generateMarkupBtnPre(curPage) {
    return `<button data-goto="${
      curPage - 1
    }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>`;
  }
  _generateMarkupBtnNext(curPage) {
    return `      
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${curPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
        </button> `;
  }
}

export default new PaginationView();
