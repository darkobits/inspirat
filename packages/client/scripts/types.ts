import type semver from 'semver';

/**
 * Chrome Extension Manifest.
 *
 * TODO: Move to separate package.
 *
 * See: https://developer.chrome.com/extensions/manifest
 */
export interface ChromeExtensionManifestV2 {
  /**
   * See: https://developer.chrome.com/extensions/manifest/manifest_version
   */
  manifest_version: 2;

  /**
   * See: https://developer.chrome.com/extensions/manifest/name#name
   */
  name: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/version
   */
  version: string;

  /**
   * Recommended
   *
   * See: https://developer.chrome.com/extensions/manifest/default_locale
   */
  default_locale?: string; // 'en'

  /**
   * Recommended
   *
   * See: https://developer.chrome.com/extensions/manifest/description
   */
  description?: string;

  /**
   * Recommended
   *
   * See: https://developer.chrome.com/extensions/manifest/icons
   */
  icons?: {
    '16'?: string;
    '48'?: string;
    '128'?: string;
  };

  /**
   * See: https://developer.chrome.com/extensions/browserAction
   *
   * Mutually-exclusive with: `page_action`
   */
  browser_action?: {
    default_icon?: {
      '16'?: string;
      '24'?: string;
      '32'?: string;
    };
    default_title?: string;
    default_popup?: string;
  };

  /**
   * See: https://developer.chrome.com/extensions/pageAction
   *
   * Mutually-exclusive with: `browser_action`
   */
  page_action?: {
    default_icon?: {
      '16'?: string;
      '24'?: string;
      '32'?: string;
    };
    default_title: string;
    default_popup: string;
  };

  // Optional
  action?: unknown;
  author?: unknown;
  automation?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/background_pages
   */
  background?: {
    scripts: Array<string>;
    persistent: boolean;
    service_worker?: string;
  };

  /**
   * See: https://developer.chrome.com/extensions/settings_override
   */
  chrome_settings_overrides?: {
    search_provider?: {
      [key: string]: any;
    };
    startup_pages?: {
      [key: string]: any;
    };
    homepage?: {
      [key: string]: any;
    };
  };

  chrome_ui_overrides: {
    bookmarks_ui: {
      remove_bookmark_shortcut: boolean;
      remove_button: boolean;
    };
  };

  /**
   * See: https://developer.chrome.com/extensions/override
   */
  chrome_url_overrides?: {
    bookmarks?: string;
    history?: string;
    newtab?: string;
  };

  /**
   * See: https://developer.chrome.com/extensions/commands
   */
  commands?: {
    [key: string]: any;
  };

  content_capabilities?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/content_scripts
   */
  content_scripts?: Array<{
    matches: Array<string>;
    css?: Array<string>;
    js?: Array<string>;
    match_about_blank?: boolean;
  }>;

  /**
   * See: https://developer.chrome.com/extensions/contentSecurityPolicy
   */
  content_security_policy?: string;

  converted_from_user_script?: unknown;

  current_locale?: unknown;

  declarative_net_request?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/devtools
   */
  devtools_page?: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/event_rules
   */
  event_rules?: Array<{
    event: string;
    actions: Array<{
      type: string;
    }>;
    conditions?: Array<{
      type: string;
      css: Array<string>;
    }>;
  }>;

  /**
   * See: https://developer.chrome.com/extensions/manifest/externally_connectable
   */
  externally_connectable?: {
    ids?: Array<string>;
    matches?: Array<string>;
    accepts_tls_channel_id?: boolean;
  };

  /**
   * See: https://developer.chrome.com/extensions/fileBrowserHandler
   */
  file_browser_handlers?: Array<{
    id: string;
    default_title: string;
    file_filters: Array<string>;
  }>;

  /**
   * See: https://developer.chrome.com/extensions/fileSystemProvider
   */
  file_system_provider_capabilities?: {
    source: 'file' | 'device' | 'network';
    configurable?: boolean;
    multiple_mounts?: boolean;
    watchable?: boolean;
  };

  /**
   * See: https://developer.chrome.com/extensions/manifest/homepage_url
   */
  homepage_url?: string;

  /**
   * See: https://developer.chrome.com/extensions/shared_modules
   */
  import?: Array<{
    id: string;
    minimum_version?: string;
  }>;

  /**
   * See: https://developer.chrome.com/extensions/manifest/incognito
   */
  incognito?: 'spanning' | 'split' | 'not_allowed';

  input_components?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/manifest/key
   */
  key?: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/minimum_chrome_version
   */
  minimum_chrome_version?: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/nacl_modules
   */
  nacl_modules?: Array<{
    path: string;
    mime_type: string;
  }>;

  oauth2?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/manifest/offline_enabled
   */
  offline_enabled?: boolean;

  /**
   * See: https://developer.chrome.com/extensions/omnibox
   */
  omnibox?: {
    keyword: string;
  };

  /**
   * See: https://developer.chrome.com/extensions/permissions
   */
  optional_permissions?: Array<string>;

  /**
   * See: https://developer.chrome.com/extensions/options#full_page
   */
  options_page?: string;

  /**
   * See: https://developer.chrome.com/extensions/options#embedded_options
   */
  options_ui?: {
    page: string;
    open_in_tab?: boolean;
    chrome_style?: boolean;
  };

  /**
   * See: https://developer.chrome.com/extensions/declare_permissions
   */
  permissions?: Array<string>;

  platforms?: unknown;

  replacement_web_app?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/manifest/requirements
   */
  requirements?: {
    '3D'?: {
      features?: ['webgl'];
    };
    plugins?: {
      npapi?: boolean;
    };
  };

  /**
   * See: https://developer.chrome.com/extensions/manifest/sandbox
   */
  sandbox?: {
    pages: Array<string>;
    content_security_policy?: Array<string>;
  };

  /**
   * See: https://developer.chrome.com/extensions/manifest/name#short_name
   */
  short_name?: string;

  signature?: unknown;

  spellcheck?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/manifest/storage
   */
  storage?: {
    managed_schema: string;
  };

  system_indicator?: unknown;

  /**
   * See: https://developer.chrome.com/extensions/ttsEngine
   */
  tts_engine?: {
    voices: Array<{
      voice_name: string;
      lang: string;
      event_types: Array<'start' | 'marker' | 'end'>;
    }>;
  };

  /**
   * See: https://developer.chrome.com/extensions/hosting
   */
  update_url?: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/version#version_name
   */
  version_name?: string;

  /**
   * See: https://developer.chrome.com/extensions/manifest/web_accessible_resources
   */
  web_accessible_resources?: Array<string>;
}

/**
 * Shape of the object we get back from chrome-webstore-upload requests.
 */
export interface ChromeWebstoreUploadResult {
  kind: string;
  id: string;
  uploadState: string;
  itemError?: Array<{
    error_code: string;
    error_detail: string;
  }>;
}


/**
 * Shape of the object provided to `shouldPublish` callbacks.
 */
export interface PublishContext {
  branch: string | undefined;
  manifest: ChromeExtensionManifestV2;
  semver: typeof semver;
  tags: Array<string>;
}


/**
 * Shape of the object accepted by publishExtension.
 */
export interface PublishExtensionOptions {
  /**
   * Root directory containing extension artifacts to be published. This
   * directory should contain a manifest.json file.
   */
  publishRoot: string;

  /**
   * Chrome Web Store extension ID of the extension to be published.
   */
  extensionId: string | undefined;

  /**
   * OAuth 2.0 client ID as created via the Google Developer Console.
   */
  clientId: string | undefined;

  /**
   * OAuth 2.0 client secret as created via the Google Developer Console.
   */
  clientSecret: string | undefined;

  /**
   * OAuth 2.0 refresh token obtained via the Google Developer Console.
   */
  refreshToken: string | undefined;

  /**
   * Callback that will be invoked with a PublishContext object and should
   * return or resolve with either:
   *
   * - `true` to proceed with publishing.
   * - `undefined` to skip publishing without a reason.
   * - `false` to skip publishing without a reason.
   * - A `string` to skip publishing and indicate the reason for skipping.
   */
  shouldPublish(context: PublishContext): boolean | string | undefined | Promise<boolean | string | undefined>;
}
