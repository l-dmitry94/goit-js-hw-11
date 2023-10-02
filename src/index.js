import axios from 'axios';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputSearch: document.querySelector("input[name='searchQuery']"),
  gallery: document.querySelector('.gallery'),
};

refs.searchForm.addEventListener('submit', handlerForm);

async function handlerForm(event) {
  event.preventDefault();
  const inputValue = event.currentTarget.elements[0].value.trim();
  const arrImages = await axiosImages(inputValue);
  const newArrImages = await arrImages.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      };
    }
  );
  const images = newArrImages.map(image => createMarkup(image)).join('');
  refs.gallery.innerHTML = images;
}

async function axiosImages(name) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '39796826-5323de49fb67ecd68459fdb2a',
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}?${params}`,
  });

  if (response.status !== 200) {
    throw new Error('Error');
  }

  const data = response.data.hits;

  return data;
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <div class="photo-card">
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
</div>
`;
}
