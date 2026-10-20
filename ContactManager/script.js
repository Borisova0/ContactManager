
const form = document.getElementById("contactForm");
const contactList = document.getElementById("contactList");
const searchInput = document.getElementById("search");
const filterGroup = document.getElementById("filterGroup");
const saveButton = document.getElementById("saveButton");

const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const groupInput = document.getElementById("group");

let contacts = [];

try {
    const saved = JSON.parse(localStorage.getItem("contacts"));
    if (Array.isArray(saved)) {
        contacts = saved;
    }
} catch (error) {
    console.log("Не удалось загрузить контакты");
}

let editingId = null;

function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function showContacts() {
    contactList.innerHTML = "";

    const search = searchInput.value.toLowerCase().trim();
    const group = filterGroup.value;

    const filtered = contacts.filter(contact => {
        const matchesSearch =
            contact.name.toLowerCase().includes(search) ||
            contact.phone.includes(search);

        const matchesGroup =
            group === "Все" || contact.group === group;

        return matchesSearch && matchesGroup;
    });

    if (filtered.length === 0) {
        contactList.textContent = "Контакты не найдены";
        return;
    }

    filtered.forEach(contact => {
        const card = document.createElement("div");
        card.className = "contact-card";

        const title = document.createElement("h3");
        title.textContent = contact.name;

        const phone = document.createElement("p");
        phone.textContent = "Телефон: " + contact.phone;

        const email = document.createElement("p");
        email.textContent = "Email: " + (contact.email || "Не указан");

        const group = document.createElement("p");
        group.textContent = "Группа: " + contact.group;

        const actions = document.createElement("div");
        actions.className = "contact-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Редактировать";
        editButton.addEventListener("click", () => {
            editContact(contact.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => {
            deleteContact(contact.id);
        });

        actions.append(editButton, deleteButton);
        card.append(title, phone, email, group, actions);
        contactList.appendChild(card);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const group = groupInput.value;

    if (name.length < 2) {
        alert("Имя должно содержать минимум 2 символа");
        return;
    }

    if (!/^\+?[\d\s()-]+$/.test(phone) ||
        phone.replace(/\D/g, "").length < 10 ||
        phone.replace(/\D/g, "").length > 15) {
        alert("Введите корректный номер телефона");
        return;
    }

    if (editingId !== null) {
        const contact = contacts.find(c => c.id === editingId);

        if (contact) {
            contact.name = name;
            contact.phone = phone;
            contact.email = email;
            contact.group = group;
        }

        editingId = null;
        saveButton.textContent = "Сохранить контакт";
    } else {
        contacts.push({
            id: crypto.randomUUID(),
            name: name,
            phone: phone,
            email: email,
            group: group
        });
    }

    saveContacts();
    showContacts();
    form.reset();
});

function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;
    groupInput.value = contact.group;

    editingId = id;
    saveButton.textContent = "Сохранить изменения";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteContact(id) {
    if (!confirm("Вы действительно хотите удалить контакт?")) {
        return;
    }

    contacts = contacts.filter(contact => contact.id !== id);

    if (editingId === id) {
        editingId = null;
        form.reset();
        saveButton.textContent = "Сохранить контакт";
    }

    saveContacts();
    showContacts();
}

searchInput.addEventListener("input", showContacts);
filterGroup.addEventListener("change", showContacts);

showContacts();
