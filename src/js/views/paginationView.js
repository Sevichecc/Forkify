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
    let markup;

    // 首页
    if (curPage === 1 && numPage > 1) {
      markup = this._generateMarkupBtnNext(curPage);
    } else if (curPage === numPage && numPage > 1) {
      //最后一页
      markup = this._generateMarkupBtnPre(curPage);
    } else if (curPage < numPage) {
      //中间的页面
      markup = this._generateMarkupBtnNext(curPage).concat(
        this._generateMarkupBtnPre(curPage)
      );
    } else {
      markup = '';
    }

    // Last page
    return markup.concat(this._generateMarkupBtnCur(curPage));
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
  // 当前页面
  _generateMarkupBtnCur(curPage) {
    return `
     <button data-goto="${curPage}" class="btn--inline pagination__btn--cur">
        <span>${curPage}</span>
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
