import { PermissionStatus } from 'unimodules-permissions-interface';
import { v4 } from 'uuid';
import { MediaTypeOptions, } from './ImagePicker.types';
const MediaTypeInput = {
    [MediaTypeOptions.All]: 'video/mp4,video/quicktime,video/x-m4v,video/*,image/*',
    [MediaTypeOptions.Images]: 'image/*',
    [MediaTypeOptions.Videos]: 'video/mp4,video/quicktime,video/x-m4v,video/*',
};
export default {
    get name() {
        return 'ExponentImagePicker';
    },
    async launchImageLibraryAsync({ mediaTypes = MediaTypeOptions.Images, allowsMultipleSelection = false, }) {
        return await openFileBrowserAsync({
            mediaTypes,
            allowsMultipleSelection,
        });
    },
    async launchCameraAsync({ mediaTypes = MediaTypeOptions.Images, allowsMultipleSelection = false, }) {
        return await openFileBrowserAsync({
            mediaTypes,
            allowsMultipleSelection,
            capture: true,
        });
    },
    /*
     * Delegate to expo-permissions to request camera permissions
     */
    async getCameraPermissionsAsync() {
        return permissionGrantedResponse();
    },
    async requestCameraPermissionsAsync() {
        return permissionGrantedResponse();
    },
    /*
     * Camera roll permissions don't need to be requested on web, so we always
     * respond with granted.
     */
    async getCameraRollPermissionsAsync() {
        return permissionGrantedResponse();
    },
    async requestCameraRollPermissionsAsync() {
        return permissionGrantedResponse();
    },
};
function permissionGrantedResponse() {
    return {
        status: PermissionStatus.GRANTED,
        expires: 'never',
        granted: true,
        canAskAgain: true,
    };
}
function openFileBrowserAsync({ mediaTypes, capture = false, allowsMultipleSelection = false, }) {
    const mediaTypeFormat = MediaTypeInput[mediaTypes];
    const input = document.createElement('input');
    input.style.display = 'none';
    input.setAttribute('type', 'file');
    input.setAttribute('accept', mediaTypeFormat);
    input.setAttribute('id', v4());
    if (allowsMultipleSelection) {
        input.setAttribute('multiple', 'multiple');
    }
    if (capture) {
        input.setAttribute('capture', 'camera');
    }
    document.body.appendChild(input);
    return new Promise((resolve, reject) => {
        input.addEventListener('change', () => {
            if (input.files) {
                const targetFile = input.files[0];
                const reader = new FileReader();
                reader.onerror = () => {
                    reject(new Error(`Failed to read the selected media because the operation failed.`));
                };
                reader.onload = ({ target }) => {
                    const uri = target.result;
                    const returnRaw = () => {
                        resolve({
                            cancelled: false,
                            uri,
                            width: 0,
                            height: 0,
                        });
                    };
                    if (typeof target?.result === 'string') {
                        const image = new Image();
                        image.src = target.result;
                        image.onload = function () {
                            resolve({
                                cancelled: false,
                                uri,
                                width: image.naturalWidth ?? image.width,
                                height: image.naturalHeight ?? image.height,
                            });
                        };
                        image.onerror = () => {
                            returnRaw();
                        };
                    }
                    else {
                        returnRaw();
                    }
                };
                // Read in the image file as a binary string.
                reader.readAsDataURL(targetFile);
            }
            else {
                resolve({ cancelled: true });
            }
            document.body.removeChild(input);
        });
        const event = new MouseEvent('click');
        input.dispatchEvent(event);
    });
}
//# sourceMappingURL=ExponentImagePicker.web.js.map