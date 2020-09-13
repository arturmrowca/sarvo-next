import base64

from PIL import Image, ImageOps
from resizeimage import resizeimage

from engine.tools.singleton import Singleton

import re
from io import BytesIO

class ImageConverter(Singleton):
    """
    This class is used to convert image data
    """

    def __init__(self):
        self.stdBase64Width = 512 # standard width for base 64 images when using functions here, height accordingly
        self.stdBase64PreviewWidth = 128 # standard preview width for base 64 images when using functions here

    def _resize(self, base64_image, size):
        """
        Resizes the input image
        :param base64:
        :param  size: tuple of width, heigth
        :return:
        """
        new_image = ImageOps.fit(base64_image, size, Image.ANTIALIAS)
        buffered = BytesIO()
        if new_image.mode == "RGBA":
            new_image.save(buffered, format="PNG")
        else:
            new_image.save(buffered, format="JPEG")
        str_image = base64.b64encode(buffered.getvalue())

        #img_base64 = bytes("data:image/jpeg;base64,", encoding='utf-8') + str_image
        img_base64 = "data:image/jpeg;base64," + str_image.decode("utf-8")
        return img_base64

    def stdBaseAndPreview(self, base64Input):
        """
        Takes a raw string and returns its converted version in
        standard format for both preview and actual image
        :param base64:
        :return:
        """

        # read image
        image_data = re.sub('^data:image/.+;base64,', '', base64Input)
        im = Image.open(BytesIO(base64.b64decode(image_data)))

        # resize to standard image
        fac = self.stdBase64Width / im.size[0]
        new_size = (int(fac * im.size[0]), int(fac * im.size[1]))
        std_image = self._resize(im, new_size)


        # resize to standard preview
        fac = self.stdBase64PreviewWidth / im.size[0]
        new_size = (int(fac * im.size[0]), int(fac * im.size[1]))
        std_preview = self._resize(im, new_size)

        return std_image, std_preview