/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** @example "Not Found" */
export type QuoteErrorResponse = string

/** @example "Invalid source transaction hash" */
export type StatusErrorResponse = string

export interface QuoteResponse {
  /**
   * type of bridging solution to be used for specified route. Currently following solutions are available 'trustless', 'mint-burn', 'circle', 'gateway' and 'none'. Here, 'none' is used when there is no bridging used like in case of same chain swap.
   * @example "trustless"
   */
  flowType: string
  /**
   * true if route is direct transfer without any swap.
   * @example true
   */
  isTransfer?: boolean
  /**
   * deprecated. Not used
   * @example false
   */
  isWrappedToken?: boolean
  /**
   * Depending upon 'flowType' and 'isTransfer', allowance has to be given to a particular contracts. All possible list of contracts can be queries via GET /api/v2/contracts
   * @example "0x190fC3352b361852E6abFE48d34C79473fF131D3"
   */
  allowanceTo?: string
  /** Bridge fee information for the cross-chain transaction */
  bridgeFee?: {
    /** The bridge fee amount as a string */
    amount: string
    /** Number of decimal places for the bridge fee amount */
    decimals: number
    /** Symbol of the token used for bridge fee */
    symbol: string
  }
  /**
   * source token as per request
   * @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054"
   */
  fromTokenAddress?: string
  /**
   * destination token as per request
   * @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936"
   */
  toTokenAddress?: string
  /** In case of source swap. 'tokenAmount' is amount user provides. It contains path details for swap that will be used by dexSpan contract (Nitro's swapper contract). Note - native tokens are represented as its wrapped native in quote as it's used by dexSpan. Actual input token is determined by user request `fromTokenAddress` if to be taken as gas. */
  source?: {
    /** @example "80001" */
    chainId: string
    /** source input token */
    asset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** source final swapped token that will be transferred to destination through a 'flowType'. */
    stableReserveAsset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "200000000000000000000" */
    tokenAmount: string
    /** @example "200000000000000000000" */
    stableReserveAmount: string
    /**
     * If length of path is greater than 1, then only token is swap from index 0 'asset' to index length-1 'stableReserveAsset' of array using others as intermediate tokens.
     * @example []
     */
    path: string[]
    /**
     * flags represents aggregators and DEXs that is mapped in dexspan contract.
     * @example []
     */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "2000237" */
    bridgeFeeAmount: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  /** In case of destination swap. `tokenAmount` is final amount that will be given to user. It contains path details for swap that will be used by dexSpan contract (Nitro's swapper contract).  Currently, final output token as wrapped native is not supported. */
  destination?: {
    /** @example "43113" */
    chainId: string
    /** 'stableReserveAsset' is swapped to 'asset' if path length > 1 and sent to receiver. Note - final token as wrapped native is not supported currently. User will get native on destination in this case. */
    asset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** token that initially is transferred on destination. */
    stableReserveAsset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "199999997999763" */
    tokenAmount: string
    /** @example "199999997999763" */
    stableReserveAmount: string
    /**
     * If length of path is greater than 1, then only token is swap from index 0 'stableReserveAsset' to index length-1 'asset' of array using others as intermediate tokens.
     * @example []
     */
    path: string[]
    /** @example [] */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  /** @example 0 */
  partnerId?: number
  /**
   * Estimated time of completion in seconds. Its based on chain combination and 'flowType'.
   * @example 40
   */
  estimatedTime?: number
  /** @example 1 */
  slippageTolerance?: number
}

export interface StatusResponse {
  /**
   * Transaction completion status.
   * @example "completed"
   */
  status: string
  /** @example "80001" */
  src_chain_id: string
  /** @example "5" */
  dest_chain_id: string
  /** @example "0x2e2bcff05d5602bd1b983132076c693c9ff35c925b1ad45a60aed9755aca5e19" */
  src_tx_hash: string
  /** @example "0x4e05ebda5183e926c0f4980e3101be9f461dfbca061edf08aa569889354752a5" */
  dest_tx_hash: string
  /** @example "0x418049cA499E9B5B983c9141c341E1aA489d6E4d" */
  src_address: string
  /** @example "0x8725bfdCB8896d86AA0a6342A7e83c1565f62889" */
  dest_address: string
  /** @example "201.0" */
  src_amount: string
  /** @example "5.007069887860371228" */
  dest_amount: string
  /** @example "SHI" */
  src_symbol: string
  /** @example "ROUTE" */
  dest_symbol: string
  /** @example 1696572856 */
  src_timestamp: number
  /** @example 1696573932 */
  dest_timestamp: number
}

/** Request body contains response of /v2/quote response with these additional params 'senderAddress', 'receiverAddress' and 'refundAddress'. */
export interface TransactionRequestBody {
  /** @example "trustless" */
  flowType: string
  /** @example true */
  isTransfer?: boolean
  /** @example false */
  isWrappedToken?: boolean
  /** @example "0x190fC3352b361852E6abFE48d34C79473fF131D3" */
  allowanceTo?: string
  bridgeFee?: {
    amount: string
    decimals: number
    symbol: string
  }
  source?: {
    /** @example "80001" */
    chainId: string
    asset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    stableReserveAsset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "19399929" */
    tokenAmount: string
    /** @example "19399929" */
    stableReserveAmount: string
    /** @example [] */
    path: string[]
    /** @example [] */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "600071" */
    bridgeFeeAmount: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  destination?: {
    /** @example "43113" */
    chainId: string
    asset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    stableReserveAsset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "199999997999763" */
    tokenAmount: string
    /** @example "199999997999763" */
    stableReserveAmount: string
    /** @example [] */
    path: string[]
    /** @example [] */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
  fromTokenAddress?: string
  /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
  toTokenAddress?: string
  /** @example "0" */
  partnerId?: string
  /** @example 40 */
  estimatedTime?: number
  /** @example 1 */
  slippageTolerance?: number
  /**
   * user's source chain address
   * @example "0x2B351b7bbC86ab5DF433539fE907f8EE4DE1B964"
   */
  senderAddress: string
  /**
   * user's destination chain address
   * @example "0x2B351b7bbC86ab5DF433539fE907f8EE4DE1B964"
   */
  receiverAddress: string
  /**
   * Address where user will be refunded in case when transaction doesn't go through and withdrawal is requested. Usually same as 'senderAddress'
   * @example "0x2B351b7bbC86ab5DF433539fE907f8EE4DE1B964"
   */
  refundAddress: string
}

/** In response all fields are same as request with one additional field 'txn'. */
export interface TransactionResponseBody {
  /** @example "trustless" */
  flowType: string
  /** @example true */
  isTransfer?: boolean
  /** @example false */
  isWrappedToken?: boolean
  /** @example "0x190fC3352b361852E6abFE48d34C79473fF131D3" */
  allowanceTo?: string
  source?: {
    /** @example "80001" */
    chainId: string
    asset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    stableReserveAsset: {
      /** @example 12 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "80001" */
      chainId: string
      /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "200000000000000000000" */
    tokenAmount: string
    /** @example "200000000000000000000" */
    stableReserveAmount: string
    /** @example [] */
    path: string[]
    /** @example [] */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "2000237" */
    bridgeFeeAmount: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  destination?: {
    /** @example "43113" */
    chainId: string
    asset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    stableReserveAsset: {
      /** @example 6 */
      decimals: number
      /** @example "USDT" */
      symbol: string
      /** @example "USDT" */
      name: string
      /** @example "43113" */
      chainId: string
      /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
      address: string
      /** @example "usdi" */
      resourceID: string
      /** @example false */
      isMintable: boolean
      /** @example false */
      isWrappedAsset: boolean
    }
    /** @example "199999997999763" */
    tokenAmount: string
    /** @example "199999997999763" */
    stableReserveAmount: string
    /** @example [] */
    path: string[]
    /** @example [] */
    flags: string[]
    /** @example "0" */
    priceImpact: string
    /** @example "" */
    tokenPath: string
    /** @example [] */
    dataTx: string[]
  }
  /** @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054" */
  fromTokenAddress?: string
  /** @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936" */
  toTokenAddress?: string
  /** @example "0x2B351b7bbC86ab5DF433539fE907f8EE4DE1B964" */
  senderAddress?: string
  /** @example "0x2B351b7bbC86ab5DF433539fE907f8EE4DE1B964" */
  receiverAddress?: string
  /** @example "0" */
  partnerId?: string
  /**
   * transaction object for a chain. Can be different for different chain types.
   * @example {"from":"sender or interactor","to":"contract to be invoked"}
   */
  txn: object
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

// @ts-ignore
export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://k8-testnet-pf.routerchain.dev/api/v2'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter(key => 'undefined' !== typeof query[key])
    return keys
      .map(key =>
        Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key),
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async response => {
      const r = response.clone() as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then(data => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch(e => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title Pathfinder API
 * @baseUrl https://k8-testnet-pf.routerchain.dev/api/v2
 *
 * API details for using the pathfinder API to do a cross-chain transfer/swap of tokens
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  quote = {
    /**
     * @description Get a quote for cross-chain transaction
     *
     * @tags Quote
     * @name Quote
     * @summary Returns a quote for a cross-chain txn
     * @request GET:/quote
     */
    quote: (
      query: {
        /**
         * Token address of the asset you wish to transfer from the source chain.
         * @example "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054"
         */
        fromTokenAddress: string
        /**
         * Token address of the asset you wish to receive on the destination chain.
         * @example "0xb452b513552aa0B57c4b1C9372eFEa78024e5936"
         */
        toTokenAddress: string
        /**
         * Decimal-expanded amount of the token to be transferred (for eg: if you want to transfer 1 USDC, you need to send 1000000). You can use ethers.utils.parseUnits function to calculate the decimal-adjusted amount of the source token.
         * @example "20000000000000"
         */
        amount: string
        /**
         * Network ID of the source chain (eg: 80001 for mumbai testnet, 43113 for fuji)
         * @example "80001"
         */
        fromTokenChainId: string
        /**
         * Network ID of the destination chain (eg: 43113 for fuji)
         * @example "43113"
         */
        toTokenChainId: string
        /**
         * For testing omit this parameter. For any partnership, you can get your unique partner id - https://app.routernitro.com/partnerId
         * @example 0
         */
        partnerId?: number
      },
      params: RequestParams = {},
    ) =>
      this.request<QuoteResponse, QuoteErrorResponse>({
        path: `/quote`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  }
  transaction = {
    /**
     * @description Get transaction data for cross-chain execution
     *
     * @tags Transaction
     * @name Transaction
     * @summary Returns the quote and txn data for executing a cross-chain txn
     * @request POST:/transaction
     */
    transaction: (data: TransactionRequestBody, params: RequestParams = {}) =>
      this.request<TransactionResponseBody, QuoteErrorResponse>({
        path: `/transaction`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  }
  status = {
    /**
     * @description Check the status of a cross-chain transaction
     *
     * @tags Check Status
     * @name Status
     * @summary Returns the status of a cross-chain txn
     * @request GET:/status
     */
    status: (
      query: {
        /**
         * Transaction hash of the successfully mined source chain transaction.
         * @example "0x2e2bcff05d5602bd1b983132076c693c9ff35c925b1ad45a60aed9755aca5e19"
         */
        srcTxHash: string
      },
      params: RequestParams = {},
    ) =>
      this.request<StatusResponse, StatusErrorResponse>({
        path: `/status`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  }
}
