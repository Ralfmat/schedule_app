export const redirectIfLoggedIn = () => {
    if (localStorage.getItem("access_token") !== null) {
        window.location.href = "/"
      }
}