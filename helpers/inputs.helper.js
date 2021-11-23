



/**
 * 
 * @param {String} phone
 * Verifies if the phone is a valid phone number
 * 
 */
const verifyphone = (phone) => {
    return new Promise((res, req) => {
        try {
            // TODO
            res(true);
        } catch (error) {
            // TODO
            res(false);
        }
    });
};

/**
 * Collects device finger print
 * 
 */
const collectdevicefingerprint = () => {
    return Promise((res,rej) => {
    })
}

module.exports = { verifyphone };