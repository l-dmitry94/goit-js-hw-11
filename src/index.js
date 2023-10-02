import axios from 'axios';

const refs = {
  searchForm: document.querySelector('#search-form'),
  inputSearch: document.querySelector("input[name='searchQuery']"),
};

refs.searchForm.addEventListener('submit', handlerForm);

function handlerForm(event) {
  event.preventDefault();
  const inputValue = event.currentTarget.elements[0].value;
  inputValue.trim();

  const arrImages = axiosImages(inputValue);
  const newArrImages = arrImages.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      
    }
  );
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

  const arrData = data.map(image => console.log(image));
  return arrData;
}
