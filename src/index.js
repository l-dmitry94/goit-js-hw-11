import axios from 'axios';

import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputSearch: document.querySelector("input[name='searchQuery']"),
  galleryList: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more'),
};

let currentPage = 1;
let inputValue = '';
let lightbox = null;

refs.searchForm.addEventListener('submit', handlerForm);
refs.loadMoreButton.addEventListener('click', onLoad);

async function handlerForm(event) {
  event.preventDefault();

  if (currentPage) {
    refs.galleryList.innerHTML = '';
  }
  const { searchQuery } = event.currentTarget.elements;
  inputValue = searchQuery.value;

  const data = await getImages(inputValue, currentPage);

  if (data.hits.length === 0) {
    refs.loadMoreButton.classList.add('hidden');
    return;
  } else {
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  refs.galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
  lightbox = new SimpleLightbox('.card-link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

  if (currentPage !== Math.ceil(data.totalHits / 40)) {
    refs.loadMoreButton.classList.remove('hidden');
  }
  refs.inputSearch.value = '';
}

async function getImages(name, page) {
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

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function onLoad() {
  try {
    currentPage += 1;
    const data = await getImages(inputValue, currentPage);
    refs.galleryList.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();

    if (currentPage >= Math.ceil(data.totalHits / 40)) {
      refs.loadMoreButton.classList.add('hidden');
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
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
