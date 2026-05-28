package com.zami.wellmind

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView

class PermissionsRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(48, 48, 48, 48)
        }

        val title = TextView(this).apply {
            text = "WellMind Health Connect Access"
            textSize = 22f
            setPadding(0, 0, 0, 24)
        }

        val body = TextView(this).apply {
            text = "WellMind reads Health Connect steps, heart rate, sleep, and optional oxygen saturation only after your permission. This data is used to show wellness insights inside the app. You can revoke access any time in Android Health Connect settings."
            textSize = 16f
            setLineSpacing(6f, 1.0f)
        }

        container.addView(title)
        container.addView(body)
        setContentView(container)
    }
}
