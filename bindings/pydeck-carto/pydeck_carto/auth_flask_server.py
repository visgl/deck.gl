from os import environ as env
from flask import Flask, redirect, render_template, session, url_for

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY", "oiuwefASDFkjsdfoiyub2987lkjsdf98y")


@app.route("/callback/")
def home():
    return render_template(
        "callback.html",
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=env.get("PORT", 8888))
