// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const apodUrl = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';
const apiKey = 'MPb6jJKDDCPMhKgmhBGGQdBTjmkftPGtWbttjBbp';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

getImagesButton.addEventListener('click', getSpaceImages);

function showGalleryMessage(message) {
  const paragraph = document.createElement('p');
  paragraph.className = 'gallery-message';
  paragraph.textContent = message;
  gallery.replaceChildren(paragraph);
}

async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showGalleryMessage('Please choose both a start date and an end date.');
    return;
  }

  if (startDate > endDate) {
    showGalleryMessage('The start date must be before the end date.');
    return;
  }

  // Show a loading message while NASA's API sends back the images.
  showGalleryMessage('Loading space images...');
  getImagesButton.disabled = true;

  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    api_key: apiKey
  });

  try {
    const response = await fetch(`${apodUrl}?${params}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'NASA could not load images for those dates.');
    }

    // A date range normally returns an array; this also handles a single result.
    const images = (Array.isArray(data) ? data : [data])
      .filter((item) => item.media_type === 'image' && item.url && item.title && item.date);

    if (images.length === 0) {
      showGalleryMessage('No space images were found for that date range.');
      return;
    }

    // Build each card with DOM methods so API text is displayed safely.
    gallery.replaceChildren();

    images.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'gallery-item';

      const image = document.createElement('img');
      image.src = item.hdurl;
      image.alt = item.title;
      image.loading = 'lazy';

      const title = document.createElement('h2');
      title.textContent = item.title;

      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = item.date;

      card.append(image, title, date);
      gallery.append(card);
    });
  } catch (error) {
    showGalleryMessage(`Unable to get space images: ${error.message}`);
  } finally {
    getImagesButton.disabled = false;
  }
}
