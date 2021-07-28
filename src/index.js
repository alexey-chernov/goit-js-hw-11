import './sass/styles.css';
import '../node_modules/simplelightbox/src/simple-lightbox.scss';
import SimpleLightbox from "simplelightbox";
import axios from 'axios';
import { Notify } from 'notiflix';
import imageCardTpl from './templates/imgcard.hbs';

const refs = {
    imageGallery: document.querySelector('.gallery'),
    searchForm: document.querySelector('#search-form'),
    input: document.querySelector('input'),
    btnSubmit: document.querySelector('button[type=submit]'),
    btnLoadMore: document.querySelector('button[type=button]'),
};

var lightbox = new SimpleLightbox('.gallery a');
axios.defaults.baseURL = 'https://pixabay.com/api';

const OPTIONS = '&image_type=photo&orientation=horizontal&safesearch=true&per_page=40';
const APIKEY = '22564694-3177f5daba1f2572eee652a36';
let keyWord = '';
let pageNum;

refs.btnLoadMore.classList.add('is-hidden');

refs.searchForm.addEventListener('submit', onSearch);
refs.btnLoadMore.addEventListener('click', onLoadMore);

function onSearch(event) {
    event.preventDefault();
    refs.btnLoadMore.classList.add('is-hidden');
    pageNum = 1;

    const form = event.currentTarget;
    keyWord = form.elements.searchQuery.value.trim();

    clearMarkup();

    if (keyWord !== "") {
        fetchImagesByKeyWord(keyWord)
            .then(images => {

                if (images.hits.length === 0) {
                    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
                }

                else {
                    renderImagesCardsMarkup(images);

                    const totalHits = images.totalHits;
                    Notify.info(`Hooray! We found ${totalHits} images.`,);

                    lightbox.refresh();
                    refs.btnLoadMore.classList.remove('is-hidden');
                };
            })
            .catch(error => console.log(error));
    };
};

function onLoadMore(event) {
    event.preventDefault();
    incrementPageNum();

    fetchImagesByKeyWord(keyWord)
        .then(images => {
            if (images.hits.length === 0) {
                Notify.failure("We're sorry, but you've reached the end of search results.");
                refs.btnLoadMore.classList.add('is-hidden');
            }

            else {
                renderImagesCardsMarkup(images);
                lightbox.refresh();
            }
        })
        .catch(error => console.log(error));
};

async function fetchImagesByKeyWord(keyWord) {
    const response = await axios.get(`/?key=${APIKEY}&q=${keyWord}${OPTIONS}&page=${pageNum}`);
    return response.data;
};

function createImagesCardsMarkup(images) {
    return images.hits.map(imageCardTpl).join('');
};

function renderImagesCardsMarkup(images) {
    const markup = createImagesCardsMarkup(images);
    const markupCreating = refs.imageGallery.insertAdjacentHTML('beforeend', markup);
};

function clearMarkup() {
    refs.imageGallery.innerHTML = "";
};

function incrementPageNum() {
    pageNum += 1;
};

