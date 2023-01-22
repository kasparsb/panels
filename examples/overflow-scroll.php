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
        background: pink;
    }
    .app2 {
        __position: fixed;
        border: 2px solid green;
        margin-top: 40px;
        margin-left: 20px;
        height: 350px;
        width: 300px;
        -webkit-overflow-scrolling: touch;
    }
    .app {
        __position: absolute;
        __top: 2px;
        __left: 2px;
        border: 2px solid red;
        height: 390px;
        width: 280px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    .r {
        background: silver;
        padding: 20px;
        margin-bottom: 40px;
    }

    </style>

    <script>
        function iOS() {
          return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
          ].includes(navigator.platform)
          // iPad on iOS 13 detection
          || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        }
    </script>
</head>
</body>
    <div class="app2">
        <div class="app">
            <div class="r">1</div>
            <div class="r">2</div>
            <div class="r">3</div>
            <div class="r">4</div>
            <div class="r">5</div>
            <div class="r">6</div>
            <div class="r">7</div>
            <div class="r">8</div>
            <div class="r">9</div>
            <div class="r">10</div>
            <div class="r">11</div>
            <div class="r">12</div>
            <div class="r">13</div>
            <div class="r">14</div>
        </div>
    </div>

    <script>
        if (iOS()) {
            document.write('ios')
        }
        else {
            document.write('not ios')
        }
    </script>

    <script>
        // document.querySelector('.app').addEventListener('touchmove', function(ev){
        //     ev.preventDefault();
        // })
    </script>
</body>
</html>