<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">
    <title>Basic</title>

    <style>
    html, body {
        padding: 0;
        margin: 0;
    }
    body {
        background: green;
    }
    .viewer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        background: chartreuse;
        border: 12px solid blue;

        z-index: 10;
    }

    .slider {
        display: flex;
        overflow: hidden;
        height: 100%;
    }
    .slide {
        flex: 0 0 100%;

        border: 4px solid gray;
        box-sizing: border-box;
    }
    .slide:nth-child(1) {
        background: aquamarine
    }
    .slide:nth-child(2) {
        background: azure
    }
    .slide:nth-child(3) {
        background: burlywood
    }
    .slide:nth-child(4) {
        background: coral
    }
    .slide:nth-child(5) {
        background: crimson
    }
    .slide:nth-child(6) {
        background: darkorchid
    }


    /** šitas nodrošinās, lai fullscreen cover var paskrolēt uz leju/augšu, lai noslēptu adress bar */
    /** gan uz ios, gan android */
    .horizontal {
        width: 5px;
        background: pink;
        height: 475px;
        position: absolute;

        z-index: 100;
    }
    </style>

</head>
<body>

    <div class="viewer">
        <div class="slider">
            <div class="slide">1</div>
            <div class="slide">2</div>
            <div class="slide">3</div>
            <div class="slide">4</div>
            <div class="slide">5</div>
            <div class="slide">6</div>
        </div>
    </div>

    <div class="horizontal"></div>

    <script type="text/javascript" src="./build/ioshorizontal.min.js?rand=<?php echo time() ?>"></script>
</body>
</html>