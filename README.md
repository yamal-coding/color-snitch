# Color snitch

This web app will allow you to easilty identify colors by their hex code. Just paste the hex code in the input field and the app will show you the color along with its name. You can also pick colors from a image from your gallery.

🚧🚧 This project is still under development, so expect some bugs and missing features. If you have any suggestions or want to contribute, feel free to open an issue or a pull request. 🚧🚧

# How it works

Given an already defined list of labeled colors (hex color - color name), the app will calculate their closest euclidean distance between them and the given input color (in hex). The name of the color with the smallest distance will be will be displayed to the user. The more labeled colors we have, the more accurate the results will be.

The input color, in hex format, will be converted to Oklab because it is a perceptually uniform color space, which means that the distance between two colors in this space is more representative of how different they are perceived by the human eye compared to other color spaces like RGB or HSL.

# Tech Stack

- React + Vite

# Working with this project locally

Run following command to deploy the app over localhost:

```
$ npm run dev
```