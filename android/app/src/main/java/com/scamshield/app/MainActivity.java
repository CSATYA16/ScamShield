package com.scamshield.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScamShieldBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
