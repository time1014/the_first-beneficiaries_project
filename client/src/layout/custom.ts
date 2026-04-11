import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#eaf1f8',
            100: '#d6e4f1',
            200: '#adc9e3',
            300: '#84aed5',
            400: '#5b93c7',
            500: '#034487',
            600: '#033d7a',
            700: '#02356c',
            800: '#022e5f',
            900: '#012651',
            950: '#011a38'
        }
    }
});

export default MyPreset;
