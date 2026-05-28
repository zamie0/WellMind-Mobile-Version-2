package com.zami.wellmind;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HealthBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
