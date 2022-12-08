import random
import time
from termcolor import cprint
from web3 import Web3
import requests
import httpx

import datetime


RPC = "https://eth-mainnet.g.alchemy.com/v2/ujAP2FT6E7-oJWdWuSRaRNma4iXcdNhy"


def blurAddToPool(privatekey):

    def mint():

        try:

            web3 = Web3(Web3.HTTPProvider(RPC))
            account = web3.eth.account.privateKeyToAccount(privatekey)
            address_wallet = account.address
            contractToken = Web3.toChecksumAddress(
                '0x0000000000A39bb272e79075ade125fd351887Ac')
            ABI = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]'
            contract = web3.eth.contract(address=contractToken, abi=ABI)

            nonce = web3.eth.get_transaction_count(address_wallet)

            contract_txn = contract.functions.deposit().buildTransaction({
                'value': web3.toWei(0.01, 'ether'),
                'nonce': nonce,
            })

            signed_txn = web3.eth.account.sign_transaction(
                contract_txn, private_key=privatekey)
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)

            cprint(
                f'\n>>> https://etherscan.io/tx/{web3.toHex(tx_hash)}', 'green')
        except Exception as error:
            cprint(f'\n>>> {address_wallet} {error}', 'red')

    mint()
    time.sleep(random.randint(2, 4))


def signIn(walletAddress):
    try:
        session = requests.Session()
        data = {
            "walletAddress": walletAddress,
        }
        url = 'https://core-api.prod.blur.io/auth/challenge'
        # optHeaders = {
        #     "authority": "core-api.prod.blur.io",
        #     "accept": "*/*",
        #     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        #     "access-control-request-headers": "content-type",
        #     "origin": "https://blur.io",
        #     "referer": "https://blur.io",
        #     "sec-fetch-dest": "empty",
        #     "sec-fetch-mode": "cors",
        #     "sec-fetch-site": "same-site",
        #     "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        # }
        # opt = requests.options(url, headers=optHeaders)
        # cprint(f'options.status_code: 👉️ {opt.status_code}', 'green')
        # cookies = dict(opt.cookies)
        expires = (datetime.datetime.utcnow() + datetime.timedelta(days=30)
                   ).strftime("%a, %d %b %Y %H:%M:%S GMT")
        # cprint(
        #     f'expires: 👉️ {expires}', 'green')
        # cookies["path"] = "/"
        # cookies["expires"] = expires
        # cookies["domain"] = ".blur.io"
        # cookies["SameSite"] = "None"
        # cookies["HttpOnly"] = ""
        # cookies["Secure"] = ""
        # cookies["authToken"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHg2YTllYjc1YmY3MDg1N2IzY2MyY2E1ZDUzZTc1ZDE3OTBhNTNlODQ2Iiwic2lnbmF0dXJlIjoiMHgyNzM5OWJhZmQ3ZDVjZWE0ODk3NDllOTY4MzIwZjU4MzhhY2Y2NzRlZTlhMmZlZjljYTI0NDk3YzE5YmFiMjJiNWY0Y2Y5M2YxODIyMDYwMmE2NmI1MjU2MzYyYzFmNzg4ZjFjMzk2NjMwMWE2Zjg3MDM5NGZlMjUyNTRhN2Y1YzFjIiwiaWF0IjoxNjcwMzY1NTEyLCJleHAiOjE2NzI5NTc1MTJ9.n5-tcqk2I42SVk_lARgxWOtIAmKo8awStuSjbzUvPSs"
        # cprint(f'options: 👉️ {cookies}', 'green')

        headers = {
            "accept": "*/*",
            "accept-language": "en-GB,en;q=0.5",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Brave\";v=\"108\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "sec-gpc": "1",
            "referrer": "https://blur.io/",
            "referrerPolicy": "strict-origin-when-cross-origin",
        }
        res = httpx.post(url, json=data, headers=headers)
        cprint(f'response: 👉️ {res}', 'green')
        cprint(f'response.status_code: 👉️ {res.status_code}', 'green')
        # cprint(f'response.text: 👉️ {res.text}', 'green')

        # json = res.json()
        # cprint(f'\n>>> {json}', 'green')
    except Exception as error:
        cprint(f'\n>>> {error}', 'red')


def placeBid(contract):
    try:
        expiration = (datetime.datetime.utcnow() +
                      datetime.timedelta(seconds=30)).isoformat()
        data = {
            "contractAddress": contract,
            "expirationTime": expiration,
            "price": {
                "unit": "BETH",
                "amount": "0.01"
            },
            "amount": "0.01",
            "unit": "BETH",
            "quantity": "1"
        }
        headers = {"charset": "utf-8", "Content-Type": "application/json"}
        cookies = "rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX19P4dgXSxJZFT86NaIJ65u%2FWEUibfSPEhI%3D; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX19UjzXiUpx6woefzQwRlaaMb5MDj2JIr%2FY%3D; __cf_bm=HpTJ1st_O7lwgUSa_3TrXpsqjersUNlquiFGUSYdM4o-1670358205-0-AS+NqLYWPODpX4q4kvR7iJsqHNUlE4n/UeTI6q0Gu+KMjgQBlW9i/SDyrQ0uqQKHjLAhcFFYT/4dX1BhaxWzjTkllOc6uQC34NCXieifwODh; authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHg2YTllYjc1YmY3MDg1N2IzY2MyY2E1ZDUzZTc1ZDE3OTBhNTNlODQ2Iiwic2lnbmF0dXJlIjoiMHhlN2RkNDcxNmRlNjRjMjk3NzI2OTBhMzc2YTFhZWE4ZDIxMmJhMzU4ODNiNTE5ZDNlNzNmNDEzNjEwOTAyY2JiMDc4YmRjODZmYzY1NzkyN2ZkYTU4N2U5NDQ4MTU0MmViNTNkZGIxZjI1ZjY4Zjg4ZDRiZWMwMGU4NTA2NDFhYzFiIiwiaWF0IjoxNjY5ODI4OTgzLCJleHAiOjE2NzI0MjA5ODN9.10yL8BEixCTe4_yuN2zAomRJuQSv_QLs2mgL4aYc3GE; rl_trait=RudderEncrypt%3AU2FsdGVkX19RutCWMDk7O2FStvnc5oUpDW3NDUvwhnA%3D; rl_group_id=RudderEncrypt%3AU2FsdGVkX19pNekpTT0j8Kmagn4o0JBBEAi8pkkx%2BtU%3D; rl_group_trait=RudderEncrypt%3AU2FsdGVkX1%2B0DfSeNWIC3DmE2po%2BTtPXv%2FzfrKHVmUo%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX183bnjpr3FWrUqJW3uGwdn5RmdH6JnyjOSTURaPcjTwvJcaqdz%2BuWgvoNumEN45oktADxl%2Fd9ZIQg%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX1%2ByOY24r6nh%2FYIZ0Kyt6tFElL0c%2BTzbpBNIYma3UjjWtWgFjhvOSLiCekxul0tKtQDwQgXz2tPEoA%3D%3D; rl_session=RudderEncrypt%3AU2FsdGVkX1%2B6ar9%2Bj4TKWJ15pcClYq45LADDHEnHjptmwKUgFC1QDnmI8OoDlHuLo1ubx2DNydBmTA25vIgfXTl3SPPCmqV5vAfrwCiIWggENC4tqyfkG%2BIhjdluDXofPH1YBbDIKlYd0FgSGLZWCQ%3D%3D"
        url = 'https://core-api.prod.blur.io/v1/collection-bids/format'
        res = requests.post(url, json=data, headers=headers, cookies=cookies)
        cprint(f'response: 👉️ {res}', 'green')
        cprint(f'response.text: 👉️ {res.text}', 'green')
        cprint(f'response.status_code: 👉️ {res.status_code}', 'green')

        json = res.json()
        cprint(f'\n>>> {json}', 'green')
    except Exception as error:
        cprint(f'\n>>> {error}', 'red')


if __name__ == "__main__":

    with open("private_keys.txt", "r") as f:
        keys_list = [row.strip() for row in f]

    for privatekey in keys_list:
        blurAddToPool(privatekey)
        # web3 = Web3(Web3.HTTPProvider(RPC))
        # account = web3.eth.account.privateKeyToAccount(privatekey)
        # address_wallet = account.address
        # signIn(address_wallet)
        # placeBid("0xed5af388653567af2f388e6224dc7c4b3241c544")

        # cookies["authToken"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHg2YTllYjc1YmY3MDg1N2IzY2MyY2E1ZDUzZTc1ZDE3OTBhNTNlODQ2Iiwic2lnbmF0dXJlIjoiMHhlN2RkNDcxNmRlNjRjMjk3NzI2OTBhMzc2YTFhZWE4ZDIxMmJhMzU4ODNiNTE5ZDNlNzNmNDEzNjEwOTAyY2JiMDc4YmRjODZmYzY1NzkyN2ZkYTU4N2U5NDQ4MTU0MmViNTNkZGIxZjI1ZjY4Zjg4ZDRiZWMwMGU4NTA2NDFhYzFiIiwiaWF0IjoxNjY5ODI4OTgzLCJleHAiOjE2NzI0MjA5ODN9.10yL8BEixCTe4_yuN2zAomRJuQSv_QLs2mgL4aYc3GE"
        # cookies["rl_trait"] = "RudderEncrypt%3AU2FsdGVkX1%2BPuMg1SDia0HY7AMmMoKMt%2Bjr6j%2BtHdII%3D"
        # cookies["rl_group_id"] = "RudderEncrypt%3AU2FsdGVkX1%2BorOjpn4NbNYkTpiiH%2FfrXfrqpdZI6fqc%3D"
        # cookies["rl_group_trait"] = "RudderEncrypt%3AU2FsdGVkX19xG45ErsO0IbwP3sgkfZibqPv3E1HxQ%2F8%3D"
        # cookies["rl_anonymous_id"] = "RudderEncrypt%3AU2FsdGVkX1%2BkfT3Av3qbztnhfsrNmUQNCfgIIQ2Mlh8DOTOXZm4oAl1bvLCJu8ZXM3InSo125Mtir6cA0bp2fw%3D%3D"
        # cookies["rl_page_init_referrer"] = "RudderEncrypt%3AU2FsdGVkX1%2Bnw9uGcABai3rftiaAu4%2FCdDcOr10IVEc%3D"
        # cookies["rl_page_init_referring_domain"] = "RudderEncrypt%3AU2FsdGVkX19H9ZgrPNJbihF8JTANV%2FWAKvl8WYXXPPM%3D"
        # cookies["rl_user_id"] = "RudderEncrypt%3AU2FsdGVkX1%2BUG7OVw363bIqD1G3JCMYzplhrrEtrc6XRVsC0SDFX56Znm6zFpd5ClSj9KcV%2FMN%2B%2BqHuOZarb4A%3D%3D"
        # cookies["rl_user_id"] = "RudderEncrypt%3AU2FsdGVkX1%2BUG7OVw363bIqD1G3JCMYzplhrrEtrc6XRVsC0SDFX56Znm6zFpd5ClSj9KcV%2FMN%2B%2BqHuOZarb4A%3D%3D"
        # cookies["rl_session"] = "RudderEncrypt%3AU2FsdGVkX19upCWPmwEMX1ASQROSehtiNUVPWQ9N%2F9rcR44fVUZuVKXQn%2BXI2GSgORDV91xn%2F0WD2%2FO241C4ljruQTXGdlZS2KgGjNcRILCH6T3vLPTB9EArsI1VLN1C%2FiKKkKb87rEXcAqrokGdZg%3D%3D'"

        # rdrIdUrl = "https://rdr.blurio.workers.dev/v1/identify"
        # rdrIdHeaders = {
        #     "accept": "*/*",
        #     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        #     "sec-fetch-dest": "empty",
        #     "sec-fetch-mode": "cors",
        #     "sec-fetch-site": "cross-site",
        #     "referrer": "https://blur.io/",
        #     "referrerPolicy": "strict-origin-when-cross-origin",
        # }
        # rdrIdOpt = requests.options(rdrIdUrl, headers=rdrIdHeaders)
        # cprint(f'rdrOpt.status_code: 👉️ {rdrIdOpt.status_code}', 'green')

        # rdrTrackUrl = "https://rdr.blurio.workers.dev/v1/track"
        # rdrTrackHeaders = {
        #     "accept": "*/*",
        #     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        #     "sec-fetch-dest": "empty",
        #     "sec-fetch-mode": "cors",
        #     "sec-fetch-site": "cross-site",
        #     "referrer": "https://blur.io/",
        #     "referrerPolicy": "strict-origin-when-cross-origin",
        # }
        # rdrTrackOpt = requests.options(rdrTrackUrl, headers=rdrTrackHeaders)
        # cprint(
        #     f'rdrTrackOpt.status_code: 👉️ {rdrTrackOpt.status_code}', 'green')

        # rudder_analytics.write_key = "27LwyF7UIkiQQdAbUR43TAUjZhg"
        # rudder_analytics.data_plane_url = "https://rdr.blurio.workers.dev"

        # rdrId = requests.post(rdrIdUrl, headers=rdrIdHeaders)
        # cprint(f'rdrId.status_code: 👉️ {rdrId.status_code}', 'green')
