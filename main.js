function toggleDropdown(element) {
    const isActive = element.classList.contains("active");

    document.querySelectorAll(".project-item").forEach((item) => {
        item.classList.remove("active");
    });

    if (!isActive) {
        element.classList.add("active");
    }
}