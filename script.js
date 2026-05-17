let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
let openedRecipeId = null;
let currentPage = 0;

const recipesList = document.getElementById("recipesList");
const searchInput = document.getElementById("searchInput");

const formModal = document.getElementById("formModal");
const viewerModal = document.getElementById("viewerModal");

const addBtn = document.getElementById("addBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const saveBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("titleInput");
const coverInput = document.getElementById("coverInput");
const pagesInput = document.getElementById("pagesInput");

const closeViewerBtn = document.getElementById("closeViewerBtn");
const viewerTitle = document.getElementById("viewerTitle");
const pageImage = document.getElementById("pageImage");
const pageCounter = document.getElementById("pageCounter");

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const deleteRecipeBtn = document.getElementById("deleteRecipeBtn");

function saveToStorage() {
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
    };

    img.onload = function () {
      const canvas = document.createElement("canvas");

      const maxWidth = 1000;

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.7);

      resolve(compressed);
    };

    reader.readAsDataURL(file);
  });
}
function renderRecipes() {
  const searchText = searchInput.value.toLowerCase();

  const filtered = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchText)
  );

  recipesList.innerHTML = "";

  if (filtered.length === 0) {
    recipesList.innerHTML = `<div class="empty">Пока рецептов нет 🍳</div>`;
    return;
  }

  filtered.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.style.setProperty("--rotate", index % 2 === 0 ? "-1deg" : "1deg");

    card.innerHTML = `
      <img src="${recipe.cover}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
    `;

    card.addEventListener("click", () => openRecipe(recipe.id));

    recipesList.appendChild(card);
  });
}

function openForm() {
  formModal.classList.remove("hidden");
}

function closeForm() {
  formModal.classList.add("hidden");

  titleInput.value = "";
  coverInput.value = "";
  pagesInput.value = "";
}

async function saveRecipe() {
  const title = titleInput.value.trim();
  const coverFile = coverInput.files[0];
  const pageFiles = Array.from(pagesInput.files);

  if (!title) {
    alert("Напиши название рецепта");
    return;
  }

  if (!coverFile) {
    alert("Выбери обложку");
    return;
  }

  if (pageFiles.length === 0) {
    alert("Добавь хотя бы одну страницу рецепта");
    return;
  }

  const cover = await fileToBase64(coverFile);
  const pages = [];

  for (const file of pageFiles) {
    const page = await fileToBase64(file);
    pages.push(page);
  }

  const recipe = {
    id: Date.now(),
    title,
    cover,
    pages
  };

  recipes.unshift(recipe);
  saveToStorage();
  renderRecipes();
  closeForm();
}

function openRecipe(id) {
  openedRecipeId = id;
  currentPage = 0;

  viewerModal.classList.remove("hidden");
  renderViewer();
}

function closeViewer() {
  viewerModal.classList.add("hidden");
}

function getOpenedRecipe() {
  return recipes.find(recipe => recipe.id === openedRecipeId);
}

function renderViewer() {
  const recipe = getOpenedRecipe();

  if (!recipe) return;

  viewerTitle.textContent = recipe.title;
  pageImage.src = recipe.pages[currentPage];

  pageCounter.textContent = `Страница ${currentPage + 1} из ${recipe.pages.length}`;

  prevPageBtn.disabled = currentPage === 0;
  nextPageBtn.disabled = currentPage === recipe.pages.length - 1;

  prevPageBtn.style.opacity = currentPage === 0 ? "0.4" : "1";
  nextPageBtn.style.opacity = currentPage === recipe.pages.length - 1 ? "0.4" : "1";
}

function nextPage() {
  const recipe = getOpenedRecipe();

  if (currentPage < recipe.pages.length - 1) {
    currentPage++;
    renderViewer();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderViewer();
  }
}

function deleteRecipe() {
  if (!confirm("Удалить этот рецепт?")) return;

  recipes = recipes.filter(recipe => recipe.id !== openedRecipeId);
  saveToStorage();
  closeViewer();
  renderRecipes();
}

addBtn.addEventListener("click", openForm);
closeFormBtn.addEventListener("click", closeForm);
saveBtn.addEventListener("click", saveRecipe);

searchInput.addEventListener("input", renderRecipes);

closeViewerBtn.addEventListener("click", closeViewer);
nextPageBtn.addEventListener("click", nextPage);
prevPageBtn.addEventListener("click", prevPage);
deleteRecipeBtn.addEventListener("click", deleteRecipe);

renderRecipes();