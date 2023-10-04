import axios from 'axios';

import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputSearch: document.querySelector('input[name="searchQuery"]'),
  galleryList: document.querySelector('.gallery'),
  target: document.querySelector('.target'),
};

let currentPage = 1;
let inputValue = '';
let lightbox = null;

let option = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

refs.searchForm.addEventListener('submit', handlerForm);
let observer = new IntersectionObserver(onLoad, option);

async function handlerForm(event) {
  try {
      event.preventDefault();
  Notiflix.Loading.standard();
  if (currentPage) {
    refs.galleryList.innerHTML = '';
  }

  const { searchQuery } = event.currentTarget.elements;
  inputValue = searchQuery.value;

  const data = await getImages(inputValue, currentPage);
  if (data.hits.length !== 0) {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  refs.galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
  observer.observe(refs.target);

  lightbox = new SimpleLightbox('.card-link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

  refs.inputSearch.value = '';
  } catch (error) {
    console.log(error)
  }

}

async function getImages(name, page = 1) {
  try {
    const BASE_URL = 'https://pixabay.com/api/';
    const KEY = '39796826-5323de49fb67ecd68459fdb2a';
    const params = new URLSearchParams({
      key: KEY,
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: 40,
    });

    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}?${params}`,
    });

    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    Notiflix.Loading.remove();

    return response.data;
  } catch (error) {
    Notiflix.Loading.remove();
  }
}

async function onLoad(entries, observer) {
  try {
    entries.forEach(async entry => {
      if (entry.isIntersecting) {
        Notiflix.Loading.standard();
        currentPage += 1;
        const data = await getImages(inputValue, currentPage);
        if (currentPage === Math.ceil(data.totalHits / 40)) {
          observer.unobserve(refs.target);
        }
        refs.galleryList.insertAdjacentHTML(
          'beforeend',
          createMarkup(data.hits)
        );
        lightbox.refresh();
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
    <a class=card-link href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </a>
  </div>
    `
    )
    .join('');
}

Notiflix.Notify.init({
  fontSize: '16px',
  cssAnimation: true,
  cssAnimationDuration: 400,
  cssAnimationStyle: 'fade',
});
