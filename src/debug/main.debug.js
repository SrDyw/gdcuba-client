const allowDebug = false;

export const log = (...message) => {
    if (allowDebug) {
        console.log(message);
    }
}