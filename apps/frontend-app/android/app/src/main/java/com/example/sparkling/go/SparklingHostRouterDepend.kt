// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.content.Context
import android.net.Uri
import com.tiktok.sparkling.Sparkling
import com.tiktok.sparkling.SparklingContext
import com.tiktok.sparkling.hybridkit.service.HybridActivityStackManager
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.IBridgeContext
import com.tiktok.sparkling.method.registry.core.utils.JsonUtils
import com.tiktok.sparkling.method.router.utils.IHostRouterDepend

class SparklingHostRouterDepend: IHostRouterDepend {

    override fun openScheme(
        bridgeContext: IBridgeContext?,
        scheme: String,
        extraParams: Map<String, Any>,
        platformType: BridgePlatformType,
        context: Context?
    ): Boolean {
        val sparklingContext = SparklingContext()
        sparklingContext.scheme = scheme

        // Mirror Sparkling docs: custom query keys → Lynx __globalProps.queryItems.
        // Some hosts only surface known chrome params (title/bundle); seed init data
        // so roomId/playerId are always readable from JS.
        val queryItems = parseQueryItems(scheme)
        if (queryItems.isNotEmpty()) {
            val initPayload = mapOf(
                "queryItems" to queryItems,
                // Also flatten for readers that look at top-level globalProps.
            ) + queryItems
            sparklingContext.withInitData(
                "{ \"initial_data\":${JsonUtils.toJson(initPayload)}}"
            )
        }

        context?.let { Sparkling.Companion.build(it, sparklingContext).navigate() }
        return true
    }

    override fun closeView(
        bridgeContext: IBridgeContext?,
        type: BridgePlatformType,
        containerID: String?,
        animated: Boolean?
    ): Boolean {
        val ownerActivity = bridgeContext?.ownerActivity
        if (ownerActivity != null) {
            ownerActivity.finish()
        } else {
            HybridActivityStackManager.getTopActivity()?.finish()
        }
        return true
    }

    private fun parseQueryItems(scheme: String): Map<String, String> {
        return try {
            val uri = Uri.parse(scheme)
            val out = linkedMapOf<String, String>()
            for (name in uri.queryParameterNames) {
                val value = uri.getQueryParameter(name) ?: continue
                if (value.isNotEmpty()) out[name] = value
            }
            out
        } catch (_: Exception) {
            emptyMap()
        }
    }
}
