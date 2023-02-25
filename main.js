const API = "http://localhost:8001/contacts";
const list = document.querySelector("#contacts-list");
// форма с инпутами для ввода данных
const addForm = document.querySelector("#add-form");
const nameInp = document.querySelector("#name");
const telephoneInp = document.querySelector("#telephone");
const addressInp = document.querySelector("#address");
const emailInp = document.querySelector("#email");

// инпуты и кнопка модалки
const editnameInp = document.querySelector("#edit-name");
const edittelephoneInp = document.querySelector("#edit-telephone");
const editaddressInp = document.querySelector("#edit-address");
const editemailInp = document.querySelector("#edit-email");
const editSaveBtn = document.querySelector("#btn-save-edit");
const searchInput = document.querySelector("#search");
// переменная по которой делаем запрос на поиск
let searchVal = "";

// где отображаем кнопки для пагинации
const paginationList = document.querySelector(".pagination-list"); // kebab case
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
// макcимальное количество контактов на одной странице
const limit = 20;
//? текущая страница
let currentPage = 1;
//? макс количество страниц
let pageTotalCount = 1;

//? первоначальное отображение данных
//? первоначальный рендер, при загрузке стягиваем данные с сервера
getContacts();

async function getContacts() {
  //? name_like для поиска по ключу name
  //? q для поиска по всем ключам
  //? _limit чтобы указать макс количество элементов на одной странице
  //? _page получить данные на определенной странице
  const res = await fetch(
    `${API}?name_like=${searchVal}&_limit=${limit}&_page=${currentPage}`
  ); //? обьект response //не строгое сравнивание _like //& - амперсант
  // console.log(...res.headers);
  //? x-total-count общее количество продуктов
  const count = res.headers.get("x-total-count");
  // console.log(count);
  //? формула для подсчета макс количества страниц
  pageTotalCount = Math.ceil(count / limit);

  const data = await res.json(); //? расшифровка данных
  // console.log(data);
  //? отображаем актуальные данные
  render(data); // принимает массив
}

//? функция для добавления в db json
async function addContacts(contact) {
  //? await для того чтобы getContacts подождала пока данные добавятся т.к. fetch асинхронный
  await fetch(API, {
    // можно сохранить в обьект config
    method: "POST",
    body: JSON.stringify(contact),
    headers: {
      "Content-Type": "application/json",
    },
  });
  // await fetch(API, config)
  //? вызываем getContacts чтобы стянуть и отобрвзить актуальные данные
  getContacts();
}
//? функция для удаления из db json
async function deleteContact(id) {
  //? await чтобы getContacts подождал пока данные удалятся
  await fetch(`${API}/${id}`, {
    // fetch асинхронный возвращает promise
    method: "DELETE",
  });
  //? стянуть отобразить актуальные данные
  getContacts();
}

//? функция для получения одного продукта
async function getOneContact(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json(); // json returns promise поэтому await //? расшифровка данных res.json()
  return data; //? возврат продукта с db.jsona
}

//? функция чтобы изменить данные
async function editContact(id, editedContact) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editedContact),
    headers: {
      "Content-Type": "application/json",
    },
  });
  getContacts();
}

//? отображаем на странице
function render(arr) {
  //? очищаем чтобы карточки не дублировались
  list.innerHTML = "";
  arr.forEach((item) => {
    list.innerHTML += `<div class="card m-5" style="width: 18rem;">
    <ul class="list-group list-group-flush">
      <li class="list-group-item">${item.name}</li>
      <li class="list-group-item">${item.address}</li>
      <li class="list-group-item">${item.telephone}</li>
      <li class="list-group-item">${item.email}</li>
    </ul>
          <button id="${item.id}" class="btn btn-danger btn-delete">DELETE</button>
          <button data-bs-toggle="modal" data-bs-target="#exampleModal" id="${item.id}" class="btn btn-dark btn-edit">EDIT</button>
        </div>
      </div>`;
  });
  renderPagination();
}

//? обработчик события для добавления (CREATE)
addForm.addEventListener("submit", (e) => {
  //? event чтобы страница не перезагружалась
  e.preventDefault();
  //? проверка на заполненность полей
  if (
    !nameInp.value.trim() ||
    !telephoneInp.value.trim() ||
    !addressInp.value.trim() ||
    !emailInp.value.trim()
  ) {
    alert("Заполните все поля");
    return; // возвращает ничего, остановка функции
  }
  //? создаем обьект для добавления в db.json
  const Contact = {
    name: nameInp.value,
    telephone: telephoneInp.value,
    address: addressInp.value,
    email: emailInp.value,
  };
  //? отправляем обьект в db.json
  addContacts(Contact);
  //   console.log(Contact);
  //? очищаем инпуты
  nameInp.value = "";
  telephoneInp.value = "";
  addressInp.value = "";
  emailInp.value = "";
});

//? обработчик события для удаления (DELETE)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteContact(e.target.id);
  }
});
//? переменная для сохранения продукта на который мы нажали
let id = null;
//? обработчик события на открытие и заполнение модалки
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    //? сохраняем id пррдукта
    id = e.target.id;
    //? получаем обьект продукта на который мы нажали
    const contact = await getOneContact(e.target.id);
    // console.log(Contact);
    //? заполняем инпута данными продукта
    editnameInp.value = contact.name;
    edittelephoneInp.value = contact.telephone;
    editaddressInp.value = contact.address;
    editemailInp.value = contact.email;
  }
});

//? обработчик события на сохранения данных
editSaveBtn.addEventListener("click", () => {
  //? проверека на пустоту инпутов
  if (
    !editnameInp.value.trim() ||
    !edittelephoneInp.value.trim() ||
    !editaddressInp.value.trim() ||
    !editemailInp.value.trim()
  ) {
    alert("Заполните все поля");
    //? если хотя бы один инпут пустой выводим предупреждение и останавливаем функцию
    return;
  }
  //? собираем измененный обьект для изменения продукта
  const editedContact = {
    name: editnameInp.value,
    telephone: edittelephoneInp.value,
    address: editaddressInp.value,
    email: editemailInp.value,
  };
  //? вызываем функцию для изменения
  editContact(id, editedContact);
});

//? обработчик события для поиска
searchInput.addEventListener("input", () => {
  searchVal = searchInput.value;
  currentPage = 1;
  getContacts();
});

//? функция для отображения кнопок для пагинации
function renderPagination() {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
    <li class="page-item ${currentPage == i ? "active" : ""}">
    <button class="page-link page_number">${i}</button> 
  </li>`;
  }

  //? чтобы кнопка потускнела, была неактивна на первой странице
  if (currentPage == 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }
  //? чтобы кнопка была неактивна на последней странице
  if (currentPage == pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
}

//? обработчик события чтобы перейти на определенную страницу
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    getContacts();
  }
});

//? обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
  if (currentPage == pageTotalCount) {
    return;
  }
  currentPage++;
  getContacts();
});
//? обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener("click", () => {
  if (currentPage == 1) {
    return;
  }
  currentPage--;
  getContacts();
});
